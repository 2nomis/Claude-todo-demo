const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const FILTERS = {
  all: '',
  open: 'WHERE done = 0',
  done: 'WHERE done = 1',
};

function toTodo(row) {
  return {
    id: row.id,
    title: row.title,
    done: row.done === 1,
    createdAt: row.created_at,
  };
}

// Opens (and if needed creates) the todo database at `file`; ':memory:' works for tests.
function openDb(file) {
  if (file !== ':memory:') {
    fs.mkdirSync(path.dirname(file), { recursive: true });
  }

  const db = new DatabaseSync(file);
  db.exec(`
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      done INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    )
  `);

  const listStatements = Object.fromEntries(
    Object.entries(FILTERS).map(([name, where]) => [
      name,
      db.prepare(`SELECT * FROM todos ${where} ORDER BY id`),
    ]),
  );
  const getStmt = db.prepare('SELECT * FROM todos WHERE id = ?');
  const insertStmt = db.prepare('INSERT INTO todos (title, created_at) VALUES (?, ?)');
  const updateStmt = db.prepare(
    'UPDATE todos SET title = COALESCE(?, title), done = COALESCE(?, done) WHERE id = ?',
  );
  const deleteStmt = db.prepare('DELETE FROM todos WHERE id = ?');

  function get(id) {
    const row = getStmt.get(id);
    return row ? toTodo(row) : null;
  }

  return {
    list(filter = 'all') {
      const stmt = listStatements[filter];
      if (!stmt) throw new Error(`Unknown filter: ${filter}`);
      return stmt.all().map(toTodo);
    },

    create(title) {
      const { lastInsertRowid } = insertStmt.run(title, new Date().toISOString());
      return get(Number(lastInsertRowid));
    },

    update(id, { title, done }) {
      const doneValue = done === undefined ? null : Number(done);
      const { changes } = updateStmt.run(title ?? null, doneValue, id);
      return changes ? get(id) : null;
    },

    remove(id) {
      return deleteStmt.run(id).changes > 0;
    },

    close() {
      db.close();
    },
  };
}

module.exports = { openDb, FILTERS };
