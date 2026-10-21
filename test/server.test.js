const { test, describe, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const net = require('node:net');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');

const SERVER = path.join(__dirname, '..', 'src', 'server.js');

describe('server', () => {
  let dir;

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'todo-server-'));
  });

  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  function startServer(env) {
    const child = spawn(process.execPath, ['--disable-warning=ExperimentalWarning', SERVER], {
      env: { ...process.env, HOST: '', PORT: '', DB_PATH: path.join(dir, 'todos.db'), ...env },
    });
    const output = { stdout: '', stderr: '' };
    child.stdout.on('data', (chunk) => { output.stdout += chunk; });
    child.stderr.on('data', (chunk) => { output.stderr += chunk; });
    const exited = new Promise((resolve) => child.once('exit', resolve));
    return { child, output, exited };
  }

  async function waitForOutput(output, pattern) {
    for (let i = 0; i < 100; i++) {
      const match = output.stdout.match(pattern);
      if (match) return match;
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    throw new Error(`no match for ${pattern} in: ${output.stdout}${output.stderr}`);
  }

  test('exits with a clear message when the port is in use', async () => {
    const blocker = net.createServer().listen(0, '127.0.0.1');
    await new Promise((resolve) => blocker.once('listening', resolve));
    const { port } = blocker.address();

    try {
      const { output, exited } = startServer({ PORT: String(port) });
      const code = await exited;

      assert.equal(code, 1);
      assert.match(output.stderr, new RegExp(`Port ${port} ist bereits belegt`));
      assert.doesNotMatch(output.stderr, /at Server\./, 'no stack trace expected');
    } finally {
      blocker.close();
    }
  });

  for (const port of ['abc', '-1', '70000', '3.5']) {
    test(`exits with a clear message for invalid PORT=${port}`, async () => {
      const { output, exited } = startServer({ PORT: port });
      const code = await exited;

      assert.equal(code, 1);
      assert.match(output.stderr, /Ungültiger PORT/);
      assert.doesNotMatch(output.stderr, /\n\s+at /, 'no stack trace expected');
    });
  }

  test('listens only on 127.0.0.1 by default', async () => {
    const { child, output, exited } = startServer({ PORT: '0' });
    try {
      const [, host, port] = await waitForOutput(output, /http:\/\/([^:\s]+):(\d+)/);
      assert.equal(host, '127.0.0.1');
      const res = await fetch(`http://127.0.0.1:${port}/api/todos`);
      assert.equal(res.status, 200);
    } finally {
      child.kill('SIGTERM');
      await exited;
    }
  });

  test('HOST overrides the listen address', async () => {
    const { child, output, exited } = startServer({ PORT: '0', HOST: '0.0.0.0' });
    try {
      const [, host] = await waitForOutput(output, /http:\/\/([^:\s]+):(\d+)/);
      assert.equal(host, '0.0.0.0');
    } finally {
      child.kill('SIGTERM');
      await exited;
    }
  });
});
