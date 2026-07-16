#!/usr/bin/env bash

set -Eeuo pipefail

APP_DIR="${APP_DIR:-/opt/dccs}"
APP_USER="${APP_USER:-dccs}"
APP_GROUP="${APP_GROUP:-dccs}"
DOMAIN="${DOMAIN:-dccs.daasiot.com}"
BACKEND_PORT="${BACKEND_PORT:-3100}"
FRONTEND_PORT="${FRONTEND_PORT:-3101}"
FRONTEND_HEALTH_PATH="${FRONTEND_HEALTH_PATH:-/it/admin}"
NODE_RUNTIME_VERSION="${NODE_RUNTIME_VERSION:-20.20.2}"
ENABLE_TLS="${ENABLE_TLS:-1}"
CERTBOT_EMAIL="${CERTBOT_EMAIL:-}"
SEED_DATABASE="${SEED_DATABASE:-auto}"

BACKEND_DIR="${APP_DIR}/web-console/be"
FRONTEND_DIR="${APP_DIR}/web-console/fe"
DATABASE_FILE="${BACKEND_DIR}/database.sqlite"
NGINX_SITE="/etc/nginx/sites-available/dccs"
NGINX_ENABLED="/etc/nginx/sites-enabled/dccs"
CERTIFICATE_DIR="/etc/letsencrypt/live/${DOMAIN}"
SERVICE_HOME="${APP_DIR}/.service-home"
NPM_CACHE="${APP_DIR}/.npm-cache"
NODE_RUNTIME_ROOT="${APP_DIR}/.runtime"

if [[ "${EUID}" -eq 0 ]]; then
    SUDO=()
else
    command -v sudo >/dev/null 2>&1 || {
        echo "Errore: esegui lo script come root oppure installa sudo." >&2
        exit 1
    }
    SUDO=(sudo)
fi

run_root() {
    "${SUDO[@]}" "$@"
}

run_as_app() {
    if [[ "${EUID}" -eq 0 ]]; then
        runuser -u "${APP_USER}" -- \
            env \
                HOME="${SERVICE_HOME}" \
                NPM_CONFIG_CACHE="${NPM_CACHE}" \
                PATH="${NODE_DIR}/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin" \
                "$@"
    else
        sudo -u "${APP_USER}" -- \
            env \
                HOME="${SERVICE_HOME}" \
                NPM_CONFIG_CACHE="${NPM_CACHE}" \
                PATH="${NODE_DIR}/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin" \
                "$@"
    fi
}

write_root_file() {
    local destination="$1"
    "${SUDO[@]}" tee "${destination}" >/dev/null
}

log() {
    printf '\n==> %s\n' "$1"
}

fail() {
    echo "Errore: $1" >&2
    exit 1
}

check_local_service() {
    local service_name="$1"
    local url="$2"
    local max_attempts="${SERVICE_CHECK_ATTEMPTS:-30}"
    local delay="${SERVICE_CHECK_DELAY:-2}"
    local attempt

    for ((attempt = 1; attempt <= max_attempts; attempt += 1)); do
        if curl --fail --silent --show-error --max-time 5 \
            "${url}" >/dev/null 2>&1; then
            echo "OK: ${service_name} (${url})"
            return
        fi

        if ! run_root systemctl is-active --quiet "${service_name}.service"; then
            break
        fi

        if [[ "${attempt}" -lt "${max_attempts}" ]]; then
            sleep "${delay}"
        fi
    done

    echo
    echo "Diagnostica di ${service_name}:" >&2
    run_root systemctl status "${service_name}.service" --no-pager || true
    run_root journalctl -u "${service_name}.service" -n 50 --no-pager || true
    fail "${service_name} non risponde correttamente su ${url}"
}

ensure_port_available() {
    local port="$1"
    local component="$2"

    if run_root ss -H -ltn "sport = :${port}" | grep -q .; then
        echo "La porta ${port}, richiesta da ${component}, è già occupata:" >&2
        run_root ss -ltnp "sport = :${port}" >&2 || true
        fail "scegli una porta libera con ${component^^}_PORT oppure libera la porta ${port}"
    fi
}

[[ -d "${BACKEND_DIR}" ]] || fail "backend non trovato in ${BACKEND_DIR}"
[[ -d "${FRONTEND_DIR}" ]] || fail "frontend non trovato in ${FRONTEND_DIR}"

if git -C "${APP_DIR}" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    DEPLOY_BRANCH="$(git -C "${APP_DIR}" branch --show-current)"
    DEPLOY_COMMIT="$(git -C "${APP_DIR}" rev-parse --short HEAD)"
    case "${DEPLOY_BRANCH}" in
        modernization/daas-sdk-0.17.9 | modernization/daas-sdk-0.22.0)
            ;;
        *)
            fail "branch non valido per il deploy: ${DEPLOY_BRANCH:-detached}. Passa a un branch modernization/daas-sdk-*"
            ;;
    esac
    log "Sorgente deploy: ${DEPLOY_BRANCH} (${DEPLOY_COMMIT})"
fi

[[ "${ENABLE_TLS}" == "0" || "${ENABLE_TLS}" == "1" ]] ||
    fail "ENABLE_TLS deve essere 0 oppure 1"
[[ "${SEED_DATABASE}" == "auto" || "${SEED_DATABASE}" == "0" || "${SEED_DATABASE}" == "1" ]] ||
    fail "SEED_DATABASE deve essere auto, 0 oppure 1"
[[ "${SERVICE_CHECK_ATTEMPTS:-30}" =~ ^[1-9][0-9]*$ ]] ||
    fail "SERVICE_CHECK_ATTEMPTS deve essere un intero positivo"
[[ "${SERVICE_CHECK_DELAY:-2}" =~ ^[1-9][0-9]*$ ]] ||
    fail "SERVICE_CHECK_DELAY deve essere un intero positivo"

if [[ "${ENABLE_TLS}" == "1" && ! -f "${CERTIFICATE_DIR}/fullchain.pem" && -z "${CERTBOT_EMAIL}" ]]; then
    fail "imposta CERTBOT_EMAIL per creare il certificato TLS (esempio: CERTBOT_EMAIL=admin@daasiot.com sudo ./deploy.sh)"
fi

if [[ "${ENABLE_TLS}" == "1" ]]; then
    PUBLIC_PROTOCOL="https"
    WEBSOCKET_PROTOCOL="wss"
else
    PUBLIC_PROTOCOL="http"
    WEBSOCKET_PROTOCOL="ws"
fi

log "Installazione dei pacchetti di sistema"
run_root apt-get update
PACKAGES=(nginx curl ca-certificates build-essential python3 xz-utils iproute2)
if [[ "${ENABLE_TLS}" == "1" ]]; then
    PACKAGES+=(certbot)
fi
run_root env DEBIAN_FRONTEND=noninteractive apt-get install -y "${PACKAGES[@]}"

case "$(uname -m)" in
    x86_64 | amd64)
        NODE_ARCH="x64"
        ;;
    aarch64 | arm64)
        NODE_ARCH="arm64"
        ;;
    *)
        fail "architettura non supportata per Node.js: $(uname -m)"
        ;;
esac

NODE_DIR="${NODE_RUNTIME_ROOT}/node-v${NODE_RUNTIME_VERSION}-linux-${NODE_ARCH}"
NODE_BIN="${NODE_DIR}/bin/node"
NPM_BIN="${NODE_DIR}/bin/npm"

if [[ ! -x "${NODE_BIN}" ]]; then
    log "Installazione isolata di Node.js ${NODE_RUNTIME_VERSION} in ${NODE_DIR}"
    NODE_ARCHIVE="node-v${NODE_RUNTIME_VERSION}-linux-${NODE_ARCH}.tar.xz"
    NODE_DOWNLOAD_URL="https://nodejs.org/dist/v${NODE_RUNTIME_VERSION}/${NODE_ARCHIVE}"
    TEMP_ARCHIVE="$(mktemp "/tmp/${NODE_ARCHIVE}.XXXXXX")"

    curl --fail --location --silent --show-error \
        "${NODE_DOWNLOAD_URL}" \
        --output "${TEMP_ARCHIVE}"

    run_root mkdir -p "${NODE_DIR}"
    run_root tar -xJf "${TEMP_ARCHIVE}" \
        --directory "${NODE_DIR}" \
        --strip-components=1
    rm -f "${TEMP_ARCHIVE}"
fi

NODE_VERSION="$("${NODE_BIN}" --version)"
NPM_VERSION="$("${NPM_BIN}" --version)"
NODE_MAJOR="$("${NODE_BIN}" -p 'process.versions.node.split(".")[0]')"
NODE_MINOR="$("${NODE_BIN}" -p 'process.versions.node.split(".")[1]')"

[[ "${NODE_MAJOR}" == "20" && "${NODE_MINOR}" -ge 19 ]] ||
    fail "il runtime isolato deve essere Node.js >=20.19 e <21; versione rilevata: ${NODE_VERSION}"

log "Runtime isolato: Node.js ${NODE_VERSION}, npm ${NPM_VERSION}"
if command -v node >/dev/null 2>&1; then
    log "Il Node.js globale $(node --version) resta invariato"
fi

BACKEND_EXPRESS_MAJOR="$("${NODE_BIN}" -p \
    "require('${BACKEND_DIR}/package.json').dependencies.express.replace(/^[^0-9]*/, '').split('.')[0]")"
FRONTEND_NEXT_MAJOR="$("${NODE_BIN}" -p \
    "require('${FRONTEND_DIR}/package.json').dependencies.next.replace(/^[^0-9]*/, '').split('.')[0]")"
FRONTEND_REACT_MAJOR="$("${NODE_BIN}" -p \
    "require('${FRONTEND_DIR}/package.json').dependencies.react.replace(/^[^0-9]*/, '').split('.')[0]")"

[[ "${BACKEND_EXPRESS_MAJOR}" -ge 5 ]] ||
    fail "backend obsoleto rilevato: Express major ${BACKEND_EXPRESS_MAJOR}, atteso >=5"
[[ "${FRONTEND_NEXT_MAJOR}" -ge 16 ]] ||
    fail "frontend obsoleto rilevato: Next.js major ${FRONTEND_NEXT_MAJOR}, atteso >=16"
[[ "${FRONTEND_REACT_MAJOR}" -ge 19 ]] ||
    fail "frontend obsoleto rilevato: React major ${FRONTEND_REACT_MAJOR}, atteso >=19"

log "Stack verificato: Express ${BACKEND_EXPRESS_MAJOR}, Next.js ${FRONTEND_NEXT_MAJOR}, React ${FRONTEND_REACT_MAJOR}"

if ! getent group "${APP_GROUP}" >/dev/null 2>&1; then
    log "Creazione del gruppo di servizio ${APP_GROUP}"
    run_root groupadd --system "${APP_GROUP}"
fi

if ! id "${APP_USER}" >/dev/null 2>&1; then
    log "Creazione dell'utente di servizio ${APP_USER}"
    run_root useradd \
        --system \
        --gid "${APP_GROUP}" \
        --home-dir "${APP_DIR}" \
        --shell /usr/sbin/nologin \
        "${APP_USER}"
fi

run_root mkdir -p "${SERVICE_HOME}" "${NPM_CACHE}" "${NODE_RUNTIME_ROOT}"
run_root chown -R "${APP_USER}:${APP_GROUP}" \
    "${APP_DIR}/web-console" \
    "${SERVICE_HOME}" \
    "${NPM_CACHE}"

log "Configurazione delle URL pubbliche del frontend"
write_root_file "${FRONTEND_DIR}/.env.production" <<EOF
NEXT_PUBLIC_API_BASE_URL=${PUBLIC_PROTOCOL}://${DOMAIN}/api
NEXT_PUBLIC_WS_URL=${WEBSOCKET_PROTOCOL}://${DOMAIN}/ws
EOF
run_root chown "${APP_USER}:${APP_GROUP}" "${FRONTEND_DIR}/.env.production"
run_root chmod 640 "${FRONTEND_DIR}/.env.production"

log "Installazione delle dipendenze backend"
run_as_app bash -c "cd '${BACKEND_DIR}' && npm ci"

log "Compilazione locale di sqlite3 per la glibc della VPS"
run_as_app bash -c "cd '${BACKEND_DIR}' && npm rebuild sqlite3 --build-from-source"

log "Installazione e build del frontend"
run_as_app bash -c "cd '${FRONTEND_DIR}' && npm ci && npm run build"

DATABASE_WAS_MISSING=0
if [[ ! -f "${DATABASE_FILE}" ]]; then
    DATABASE_WAS_MISSING=1
fi

log "Applicazione delle migrazioni del database"
run_as_app bash -c "cd '${BACKEND_DIR}' && NODE_ENV=production ./node_modules/.bin/sequelize-cli db:migrate"

if [[ "${SEED_DATABASE}" == "1" || ("${SEED_DATABASE}" == "auto" && "${DATABASE_WAS_MISSING}" == "1") ]]; then
    log "Inizializzazione dei dati di base"
    run_as_app bash -c "cd '${BACKEND_DIR}' && NODE_ENV=production ./node_modules/.bin/sequelize-cli db:seed:all"
fi

log "Creazione dei servizi systemd"
run_root systemctl stop dccs-backend.service dccs-frontend.service 2>/dev/null || true
ensure_port_available "${BACKEND_PORT}" "backend"
ensure_port_available "${FRONTEND_PORT}" "frontend"

write_root_file /etc/systemd/system/dccs-backend.service <<EOF
[Unit]
Description=DCCS DaaS backend
Wants=network-online.target
After=network-online.target

[Service]
Type=simple
User=${APP_USER}
Group=${APP_GROUP}
WorkingDirectory=${BACKEND_DIR}
Environment=NODE_ENV=production
Environment=HOME=${SERVICE_HOME}
Environment=PATH=${NODE_DIR}/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
Environment=HOST=127.0.0.1
Environment=PORT=${BACKEND_PORT}
Environment=DAAS_LOCAL_RECEIVER_ID=1
ExecStart=${NODE_BIN} ${BACKEND_DIR}/src/server.js
Restart=on-failure
RestartSec=5
TimeoutStopSec=20
KillSignal=SIGTERM
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=full
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
EOF

write_root_file /etc/systemd/system/dccs-frontend.service <<EOF
[Unit]
Description=DCCS Next.js frontend
Wants=network-online.target
After=network-online.target dccs-backend.service

[Service]
Type=simple
User=${APP_USER}
Group=${APP_GROUP}
WorkingDirectory=${FRONTEND_DIR}
Environment=NODE_ENV=production
Environment=HOME=${SERVICE_HOME}
Environment=PATH=${NODE_DIR}/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
ExecStart=${NODE_BIN} ${FRONTEND_DIR}/node_modules/next/dist/bin/next start -H 127.0.0.1 -p ${FRONTEND_PORT}
Restart=on-failure
RestartSec=5
TimeoutStopSec=20
KillSignal=SIGTERM
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=full
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
EOF

run_root systemctl daemon-reload
run_root systemctl enable --now dccs-backend.service dccs-frontend.service
run_root systemctl restart dccs-backend.service dccs-frontend.service

log "Verifica dei servizi applicativi locali"
check_local_service \
    "dccs-backend" \
    "http://127.0.0.1:${BACKEND_PORT}/health/live"
check_local_service \
    "dccs-frontend" \
    "http://127.0.0.1:${FRONTEND_PORT}${FRONTEND_HEALTH_PATH}"

run_root mkdir -p /var/www/certbot
run_root chown -R www-data:www-data /var/www/certbot

write_http_nginx_config() {
    write_root_file "${NGINX_SITE}" <<EOF
map \$http_upgrade \$dccs_connection_upgrade {
    default upgrade;
    ''      close;
}

server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN};

    client_max_body_size 50m;

    location ^~ /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location /ws {
        proxy_pass http://127.0.0.1:${BACKEND_PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection \$dccs_connection_upgrade;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
    }

    location /api {
        proxy_pass http://127.0.0.1:${BACKEND_PORT};
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /health {
        proxy_pass http://127.0.0.1:${BACKEND_PORT};
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location / {
        proxy_pass http://127.0.0.1:${FRONTEND_PORT};
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF
}

write_tls_nginx_config() {
    write_root_file "${NGINX_SITE}" <<EOF
map \$http_upgrade \$dccs_connection_upgrade {
    default upgrade;
    ''      close;
}

server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN};

    location ^~ /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://\$host\$request_uri;
    }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ${DOMAIN};

    ssl_certificate ${CERTIFICATE_DIR}/fullchain.pem;
    ssl_certificate_key ${CERTIFICATE_DIR}/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;

    client_max_body_size 50m;

    location /ws {
        proxy_pass http://127.0.0.1:${BACKEND_PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection \$dccs_connection_upgrade;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
    }

    location /api {
        proxy_pass http://127.0.0.1:${BACKEND_PORT};
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /health {
        proxy_pass http://127.0.0.1:${BACKEND_PORT};
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location / {
        proxy_pass http://127.0.0.1:${FRONTEND_PORT};
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF
}

log "Creazione della configurazione Nginx"
write_http_nginx_config
run_root ln -sfn "${NGINX_SITE}" "${NGINX_ENABLED}"
run_root nginx -t
run_root systemctl enable --now nginx
run_root systemctl reload nginx

if command -v ufw >/dev/null 2>&1 && run_root ufw status | grep -q '^Status: active'; then
    log "Apertura delle porte HTTP e HTTPS in UFW"
    run_root ufw allow 'Nginx Full'
fi

if [[ "${ENABLE_TLS}" == "1" ]]; then
    if [[ ! -f "${CERTIFICATE_DIR}/fullchain.pem" ]]; then
        log "Richiesta del certificato Let's Encrypt"
        run_root certbot certonly \
            --webroot \
            --webroot-path /var/www/certbot \
            --domain "${DOMAIN}" \
            --email "${CERTBOT_EMAIL}" \
            --agree-tos \
            --non-interactive
    fi

    log "Attivazione HTTPS"
    write_tls_nginx_config
    run_root mkdir -p /etc/letsencrypt/renewal-hooks/deploy
    write_root_file /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh <<'EOF'
#!/usr/bin/env bash
set -e
systemctl reload nginx
EOF
    run_root chmod 755 /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh
    run_root nginx -t
    run_root systemctl reload nginx
fi

log "Verifica finale"
curl --fail --silent --show-error --retry 10 --retry-delay 2 \
    "${PUBLIC_PROTOCOL}://${DOMAIN}/health/live" >/dev/null

READY_RESPONSE="$(curl --silent --show-error \
    "${PUBLIC_PROTOCOL}://${DOMAIN}/health/ready" || true)"

echo
echo "Deploy completato: ${PUBLIC_PROTOCOL}://${DOMAIN}"
echo "Node.js: ${NODE_VERSION}; npm: ${NPM_VERSION}"
echo "Readiness DaaS: ${READY_RESPONSE}"
echo
echo "Comandi utili:"
echo "  sudo systemctl status dccs-backend dccs-frontend nginx"
echo "  sudo journalctl -u dccs-backend -f"
echo "  sudo journalctl -u dccs-frontend -f"
