const path = require('node:path');
const express = require('express');

const { FILTERS } = require('./db');

const MAX_TITLE_LENGTH = 200;

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function parseTitle(value) {
  if (typeof value !== 'string') throw new HttpError(400, 'Titel muss ein Text sein');
  const title = value.trim();
  if (!title) throw new HttpError(400, 'Titel darf nicht leer sein');
  if (title.length > MAX_TITLE_LENGTH) {
    throw new HttpError(400, `Titel darf höchstens ${MAX_TITLE_LENGTH} Zeichen haben`);
  }
  return title;
}

function parseId(value) {
  if (!/^[1-9]\d*$/.test(value)) throw new HttpError(400, 'Ungültige ID');
  return Number(value);
}

function createApp(db) {
  const app = express();
  app.use(express.json());
  app.use(express.static(path.join(__dirname, '..', 'public')));

  const api = express.Router();

  api.get('/', (req, res) => {
    const filter = req.query.filter ?? 'all';
    if (!Object.hasOwn(FILTERS, filter)) {
      throw new HttpError(400, 'Filter muss all, open oder done sein');
    }
    res.json(db.list(filter));
  });

  api.post('/', (req, res) => {
    const title = parseTitle(req.body?.title);
    res.status(201).json(db.create(title));
  });

  api.patch('/:id', (req, res) => {
    const id = parseId(req.params.id);
    const body = req.body ?? {};
    const changes = {};

    if (body.title !== undefined) changes.title = parseTitle(body.title);
    if (body.done !== undefined) {
      if (typeof body.done !== 'boolean') throw new HttpError(400, 'done muss true oder false sein');
      changes.done = body.done;
    }
    if (Object.keys(changes).length === 0) {
      throw new HttpError(400, 'Nichts zu ändern: title oder done angeben');
    }

    const todo = db.update(id, changes);
    if (!todo) throw new HttpError(404, 'Todo nicht gefunden');
    res.json(todo);
  });

  api.delete('/:id', (req, res) => {
    const id = parseId(req.params.id);
    if (!db.remove(id)) throw new HttpError(404, 'Todo nicht gefunden');
    res.status(204).end();
  });

  app.use('/api/todos', api);

  // Express 5 forwards thrown errors here, including JSON parse errors from express.json().
  app.use((err, req, res, next) => {
    const status = err.status ?? err.statusCode ?? 500;
    if (status >= 500) console.error(err);
    const message = err instanceof HttpError ? err.message
      : status < 500 ? 'Ungültige Anfrage'
        : 'Interner Fehler';
    res.status(status).json({ error: message });
  });

  return app;
}

module.exports = { createApp, MAX_TITLE_LENGTH };
