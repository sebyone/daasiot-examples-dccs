# Backend DaaS-IoT Web Console

Backend Express con API HTTP, WebSocket, SQLite/Sequelize e adapter DaaS.

## Avvio

```bash
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

Il server usa la porta `3000`, modificabile tramite `PORT`.

## Verifica

```bash
npm run check
npm test
```

Endpoint operativi:

- `GET /health/live`: verifica che il processo HTTP sia attivo;
- `GET /health/ready`: verifica database e runtime DaaS;
- `GET /api/version`: riporta versione e compatibilità dell'adapter DaaS;
- `GET /api-docs`: documentazione OpenAPI.

## Configurazione DaaS

- `DAAS_LOCAL_RECEIVER_ID`: receiver locale da usare, default `1`;
- `DAASIOT_LIB`: percorso opzionale a una `libdaas.so` esterna.

Questo branch usa `daas-sdk@0.22.0` su Linux x64 e Node.js `20.20.2`.
Il pacchetto locale in `vendor/daas-sdk-0.22.0.tgz` include il precompilato
`libdaas.so`; durante `npm install` viene compilato l'addon
`build/Release/daas.node`.

Verifica completa:

```bash
npm ci
npm run db:migrate
npm test
npm run smoke
```
