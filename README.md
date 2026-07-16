# DaaS-IoT DCCS examples

Repository applicativo composto da:

- `web-console/be`: API HTTP/WebSocket, persistenza SQLite e adapter DaaS;
- `web-console/fe`: console amministrativa Next.js;
- `devices`: esempi relativi ai dispositivi;
- `documents`: documentazione aggiuntiva.

## Requisiti

- Node.js 20.20.2
- npm 10.8+

## Installazione

```bash
npm run install:all
```

Configurare il frontend copiando `web-console/fe/.env.example` in
`web-console/fe/.env.local`.

Preparare il database:

```bash
npm run db:migrate --prefix web-console/be
npm run db:seed --prefix web-console/be
```

Avviare backend e frontend in due terminali:

```bash
npm run dev:backend
npm run dev:frontend
```

Backend: `http://localhost:3000`  
Frontend: `http://localhost:3001`

Health check backend:

- `GET /health/live`: processo HTTP attivo;
- `GET /health/ready`: database e runtime DaaS pronti.

## Verifiche

```bash
npm run check
npm run build
npm test
```

Questo branch usa `daas-sdk@0.22.0` e supporta attualmente Linux x64. Il
pacchetto npm locale è salvato in
`web-console/be/vendor/daas-sdk-0.22.0.tgz`: contiene `libdaas.so` e compila
l'addon Node durante `npm install`.

Requisiti aggiuntivi Linux:

```bash
sudo apt-get install build-essential python3
```

Su Windows il frontend e le API non native possono essere analizzati, ma il
runtime DaaS viene segnalato come non disponibile. L'esecuzione completa di
questo branch deve avvenire su Linux x64.
