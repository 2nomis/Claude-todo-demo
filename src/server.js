const path = require('node:path');

const { openDb } = require('./db');
const { createApp } = require('./app');

const port = Number(process.env.PORT ?? 3000);
const dbPath = process.env.DB_PATH ?? path.join(__dirname, '..', 'data', 'todos.db');

const db = openDb(dbPath);
const server = createApp(db).listen(port, () => {
  console.log(`Todo-App läuft auf http://localhost:${port} (Daten: ${dbPath})`);
});

function shutdown() {
  server.close(() => {
    db.close();
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
