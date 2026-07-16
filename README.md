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

Questo branch usa esattamente `daas-sdk@0.17.9` ed è pensato per essere
eseguito con Node.js 20.20.2. I comportamenti e i limiti interni della SDK
legacy vengono preservati e non fanno parte del refactoring applicativo.

L'integrazione DaaS è isolata sotto `web-console/be/src/daas`, così il futuro
branch basato su `daas-sdk@0.22.0` potrà sostituire l'adapter senza riscrivere
il resto del backend.
