const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const net = require('node:net');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');

const SERVER = path.join(__dirname, '..', 'src', 'server.js');

test('server exits with a clear message when the port is in use', async () => {
  const blocker = net.createServer().listen(0);
  await new Promise((resolve) => blocker.once('listening', resolve));
  const { port } = blocker.address();
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'todo-server-'));

  try {
    const child = spawn(process.execPath, ['--disable-warning=ExperimentalWarning', SERVER], {
      env: { ...process.env, PORT: String(port), DB_PATH: path.join(dir, 'todos.db') },
    });
    let stderr = '';
    child.stderr.on('data', (chunk) => { stderr += chunk; });

    const code = await new Promise((resolve) => child.once('exit', resolve));

    assert.equal(code, 1);
    assert.match(stderr, new RegExp(`Port ${port} ist bereits belegt`));
    assert.doesNotMatch(stderr, /at Server\./, 'no stack trace expected');
  } finally {
    blocker.close();
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
