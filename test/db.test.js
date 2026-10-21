const { test, describe, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { openDb } = require('../src/db');

describe('db', () => {
  let db;

  beforeEach(() => {
    db = openDb(':memory:');
  });

  afterEach(() => {
    db.close();
  });

  test('create returns the new todo', () => {
    const todo = db.create('Milch kaufen');
    assert.equal(todo.title, 'Milch kaufen');
    assert.equal(todo.done, false);
    assert.equal(typeof todo.id, 'number');
    assert.ok(!Number.isNaN(Date.parse(todo.createdAt)));
  });

  test('list returns todos in creation order', () => {
    db.create('eins');
    db.create('zwei');
    assert.deepEqual(db.list().map((t) => t.title), ['eins', 'zwei']);
  });

  test('list filters by open and done', () => {
    const a = db.create('offen');
    const b = db.create('erledigt');
    db.update(b.id, { done: true });

    assert.deepEqual(db.list('open').map((t) => t.id), [a.id]);
    assert.deepEqual(db.list('done').map((t) => t.id), [b.id]);
    assert.equal(db.list('all').length, 2);
  });

  test('update changes title and done independently', () => {
    const todo = db.create('alt');

    const renamed = db.update(todo.id, { title: 'neu' });
    assert.equal(renamed.title, 'neu');
    assert.equal(renamed.done, false);

    const checked = db.update(todo.id, { done: true });
    assert.equal(checked.title, 'neu');
    assert.equal(checked.done, true);
  });

  test('update returns null for an unknown id', () => {
    assert.equal(db.update(999, { title: 'x' }), null);
  });

  test('remove deletes the todo and reports whether it existed', () => {
    const todo = db.create('weg');
    assert.equal(db.remove(todo.id), true);
    assert.equal(db.list().length, 0);
    assert.equal(db.remove(todo.id), false);
  });

  test('todos survive closing and reopening the database file', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'todo-db-'));
    const file = path.join(dir, 'nested', 'todos.db');
    try {
      const first = openDb(file);
      first.create('bleibt');
      first.close();

      const second = openDb(file);
      assert.deepEqual(second.list().map((t) => t.title), ['bleibt']);
      second.close();
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});
