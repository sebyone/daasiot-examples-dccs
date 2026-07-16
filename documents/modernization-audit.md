# Analisi e piano di modernizzazione

## Architettura rilevata

Il repository contiene due applicazioni indipendenti:

- `web-console/be`: backend CommonJS basato su Express, Sequelize, SQLite,
  WebSocket e `daas-sdk`;
- `web-console/fe`: frontend Next.js App Router con React, TypeScript, Ant
  Design, Leaflet, internazionalizzazione e Web Serial per ESP32.

Il backend espone lifecycle DaaS, CRUD dei receiver e dei dispositivi,
programmazione delle funzioni, notifiche WebSocket e documentazione OpenAPI.
Il modello dati comprende `Din`, `DinLocal`, `DinLink`, `DinHasDin`, `Device`,
`DeviceModel`, `DeviceModelGroup`, funzioni, proprietà e `DDO`.

## Problemi della baseline

### Toolchain e installazione

- nessuna versione Node dichiarata;
- script backend compatibili solo con shell Unix;
- `sqlite3@5` non installabile con Node 24;
- assenza di orchestrazione dalla root;
- README insufficiente per avviare entrambe le applicazioni.

### Backend

- Express 4 e dipendenze non aggiornate;
- nessun test;
- errori statici nell'adapter DaaS e nella creazione delle risorse;
- sincronizzazione automatica dello schema durante il bootstrap;
- route molto grandi, validazione manuale e logica transazionale duplicata;
- endpoint incompleti;
- dipendenza diretta dall'istanza globale DaaS;
- assenza di gestione centralizzata degli errori e shutdown controllato;
- comportamenti difettosi già presenti nell'addon nativo di
  `daas-sdk@0.17.9`, mantenuti fuori dallo scope del refactoring applicativo.

### Frontend

- Next 14/React 18 con advisory di sicurezza critici;
- `ignoreBuildErrors: true` nascondeva circa 90 errori TypeScript;
- contratti TypeScript diversi dalle risposte effettive del backend;
- URL HTTP usato anche come URL WebSocket;
- font Google scaricato durante la build;
- due copie quasi identiche dell'updater ESP32;
- updater firmware non operativo;
- servizi API monolitici, receiver hard-coded e gestione errori duplicata;
- nessun test automatico.

## Prima fase: aggiornamento della piattaforma

- runtime comune Node.js 20.20.2 e npm 10.8 o successivo;
- script root per installazione, sviluppo, check, build e test;
- script portabili tramite `cross-env`;
- backend aggiornato a Express 5, SQLite 6 e patch stabili correnti;
- frontend aggiornato a Next 16, React 19, Ant Design 6, next-intl 4,
  React Leaflet 5, Axios ed esptool-js correnti;
- migrazione Next `middleware` -> `proxy` e request config next-intl 4;
- build resa indipendente da Google Fonts;
- TypeScript riattivato nella build e contratti principali riallineati;
- URL WebSocket separato tramite `NEXT_PUBLIC_WS_URL`;
- updater ESP32 consolidato e collegato ai file TAR selezionati;
- correzione dei bug backend rilevati dal lint;
- test Node sulle utility DDO e paginazione;
- override transitive non-breaking per eliminare gli advisory risolvibili.

## Seconda fase: backend testabile e runtime isolato

- separazione tra app Express, server HTTP, WebSocket, bootstrap database e
  bootstrap DaaS;
- dependency injection per router e servizi DaaS, così da poter sostituire
  l'adapter senza cambiare i contratti HTTP;
- rimozione di `sequelize.sync()` dal normale avvio: lo schema viene gestito
  esclusivamente dalle migration;
- lifecycle completo con start, stop, restart e shutdown ordinato;
- middleware globali per route non trovate ed errori;
- endpoint `/health/live` e `/health/ready`, con readiness distinta per
  database e DaaS;
- receiver locale configurabile tramite `DAAS_LOCAL_RECEIVER_ID`;
- correzione dell'invio DDO: payload JSON serializzato, DIN validato e DIN
  locale ricavato dal runtime;
- caricamento lazy dell'addon legacy, senza probe preventivi che modifichino o
  blocchino il comportamento della versione `0.17.9`;
- test di integrazione per bootstrap, readiness, shutdown e indisponibilità
  DaaS, oltre ai test dell'adapter e delle utility.

## Stato verificato

- installazione backend e frontend completata su Node.js 20.20.2;
- migration SQLite aggiornate e seed completati;
- bootstrap HTTP/database verificato;
- shutdown completato senza handle nativi pendenti;
- bootstrap reale di `daas-sdk@0.17.9` completato: `doInit`, driver, mapping e
  `doPerform`;
- `/health/live`: `200`;
- `/health/ready`: `200` con database e nodo DaaS inizializzati;
- `/api/version`: conferma SDK `0.17.9`, Node.js 20.20.2 e addon caricato;
- check backend e frontend completati senza errori, con warning legacy;
- 8 test backend superati;
- typecheck frontend completato;
- build production Next.js completata;
- audit frontend: 0 vulnerabilità;
- audit backend: 2 vulnerabilità moderate residue nella catena Sequelize/UUID,
  senza aggiornamento upstream non-breaking disponibile.

## Fasi successive

1. Creare, quando disponibile la libreria locale, il branch dedicato
   `daas-sdk@0.22.0` partendo dalla stessa base modernizzata.
2. Introdurre validazione schema per input e output API.
3. Suddividere progressivamente le route in controller, service e repository,
   mantenendo transazioni esplicite.
4. Generare i tipi frontend dal contratto OpenAPI e dividere `configService`.
5. Correggere i warning React Hooks e rimuovere codice/import inutilizzati.
6. Ampliare la copertura con test API, component test ed end-to-end.
