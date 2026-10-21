const { test } = require('node:test');
const assert = require('node:assert/strict');

const { formatUrl } = require('../src/url');

test('formatUrl keeps hostnames and IPv4 addresses as they are', () => {
  assert.equal(formatUrl('127.0.0.1', 3000), 'http://127.0.0.1:3000');
  assert.equal(formatUrl('localhost', 8080), 'http://localhost:8080');
});

test('formatUrl wraps IPv6 addresses in brackets', () => {
  assert.equal(formatUrl('::1', 3000), 'http://[::1]:3000');
  assert.equal(formatUrl('::', 3000), 'http://[::]:3000');
});
