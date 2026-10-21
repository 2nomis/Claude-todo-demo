const path = require('node:path');

const { openDb } = require('./db');
const { createApp } = require('./app');

const portSetting = process.env.PORT || '3000';
// Only reachable from this machine unless HOST is set (e.g. HOST=0.0.0.0).
const host = process.env.HOST || '127.0.0.1';
const dbPath = process.env.DB_PATH ?? path.join(__dirname, '..', 'data', 'todos.db');

if (!/^\d+$/.test(portSetting) || Number(portSetting) > 65535) {
  console.error(`Ungültiger PORT "${portSetting}": erlaubt ist eine ganze Zahl von 0 bis 65535.`);
  process.exit(1);
}
const port = Number(portSetting);

const db = openDb(dbPath);
// Express 5 also calls this callback with the error if listening fails;
// that case is reported by the 'error' handler below.
const server = createApp(db).listen(port, host, (err) => {
  if (err) return;
  console.log(`Todo-App läuft auf http://${host}:${server.address().port} (Daten: ${dbPath})`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${port} ist bereits belegt. Anderen Port wählen, z. B. PORT=3001 npm start`);
  } else {
    console.error(`Server konnte nicht starten: ${err.message}`);
  }
  db.close();
  process.exit(1);
});

function shutdown() {
  server.close(() => {
    db.close();
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
