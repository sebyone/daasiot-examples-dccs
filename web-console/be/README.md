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

- `DAAS_LOCAL_RECEIVER_ID`: receiver locale da usare, default `1`.

Questo branch fissa `daas-sdk` alla versione `0.17.9` e Node.js alla versione
`20.20.2`. Il backend utilizza la SDK legacy con il comportamento già previsto
dal progetto originale, senza introdurre controlli bloccanti sui suoi difetti
interni.

La futura libreria `0.22.0` potrà essere integrata sostituendo
l'implementazione sotto `src/daas`, senza modificare bootstrap e API.
