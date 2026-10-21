const net = require('node:net');

// Builds the URL shown at startup; IPv6 hosts need brackets (http://[::1]:3000).
function formatUrl(host, port) {
  const hostPart = net.isIPv6(host) ? `[${host}]` : host;
  return `http://${hostPart}:${port}`;
}

module.exports = { formatUrl };
