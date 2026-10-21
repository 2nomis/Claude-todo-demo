const { test, describe, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

const { openDb } = require('../src/db');
const { createApp } = require('../src/app');

describe('api', () => {
  let db;
  let server;
  let baseUrl;

  before(async () => {
    db = openDb(':memory:');
    server = createApp(db).listen(0);
    await new Promise((resolve) => server.once('listening', resolve));
    baseUrl = `http://127.0.0.1:${server.address().port}/api/todos`;
  });

  after(async () => {
    await new Promise((resolve) => server.close(resolve));
    db.close();
  });

  beforeEach(() => {
    for (const todo of db.list()) db.remove(todo.id);
  });

  function send(method, url, body) {
    return fetch(url, {
      method,
      headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  }

  test('POST creates a todo with a trimmed title', async () => {
    const res = await send('POST', baseUrl, { title: '  Brot  ' });
    assert.equal(res.status, 201);
    const todo = await res.json();
    assert.equal(todo.title, 'Brot');
    assert.equal(todo.done, false);
  });

  test('POST rejects empty, missing and too long titles', async () => {
    for (const body of [{ title: '   ' }, {}, { title: 42 }, { title: 'x'.repeat(201) }]) {
      const res = await send('POST', baseUrl, body);
      assert.equal(res.status, 400, JSON.stringify(body));
      assert.equal(typeof (await res.json()).error, 'string');
    }
  });

  test('GET lists todos and applies the filter', async () => {
    const open = await (await send('POST', baseUrl, { title: 'offen' })).json();
    const done = await (await send('POST', baseUrl, { title: 'fertig' })).json();
    await send('PATCH', `${baseUrl}/${done.id}`, { done: true });

    const all = await (await fetch(baseUrl)).json();
    assert.equal(all.length, 2);

    const onlyOpen = await (await fetch(`${baseUrl}?filter=open`)).json();
    assert.deepEqual(onlyOpen.map((t) => t.id), [open.id]);

    const onlyDone = await (await fetch(`${baseUrl}?filter=done`)).json();
    assert.deepEqual(onlyDone.map((t) => t.id), [done.id]);
  });

  test('GET rejects an unknown filter', async () => {
    const res = await fetch(`${baseUrl}?filter=bogus`);
    assert.equal(res.status, 400);
  });

  test('PATCH updates title and done', async () => {
    const todo = await (await send('POST', baseUrl, { title: 'alt' })).json();

    const res = await send('PATCH', `${baseUrl}/${todo.id}`, { title: 'neu', done: true });
    assert.equal(res.status, 200);
    const updated = await res.json();
    assert.equal(updated.title, 'neu');
    assert.equal(updated.done, true);
  });

  test('PATCH validates the body', async () => {
    const todo = await (await send('POST', baseUrl, { title: 'x' })).json();
    for (const body of [{}, { done: 'ja' }, { title: '' }, { title: 'y'.repeat(201) }]) {
      const res = await send('PATCH', `${baseUrl}/${todo.id}`, body);
      assert.equal(res.status, 400, JSON.stringify(body));
    }
  });

  test('PATCH and DELETE return 404 for unknown ids', async () => {
    assert.equal((await send('PATCH', `${baseUrl}/999`, { done: true })).status, 404);
    assert.equal((await send('DELETE', `${baseUrl}/999`)).status, 404);
  });

  test('invalid ids return 400', async () => {
    assert.equal((await send('PATCH', `${baseUrl}/abc`, { done: true })).status, 400);
    assert.equal((await send('DELETE', `${baseUrl}/1.5`)).status, 400);
  });

  test('DELETE removes a todo', async () => {
    const todo = await (await send('POST', baseUrl, { title: 'weg' })).json();
    const res = await send('DELETE', `${baseUrl}/${todo.id}`);
    assert.equal(res.status, 204);
    assert.deepEqual(await (await fetch(baseUrl)).json(), []);
  });

  test('malformed JSON returns 400 with an error body', async () => {
    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{kaputt',
    });
    assert.equal(res.status, 400);
    assert.equal(typeof (await res.json()).error, 'string');
  });

  test('titles with HTML are stored as plain text', async () => {
    const title = '<img src=x onerror=alert(1)>';
    const todo = await (await send('POST', baseUrl, { title })).json();
    assert.equal(todo.title, title);
  });
});
