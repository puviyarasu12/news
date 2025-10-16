const http = require('http');
const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, 'logs', 'changes.log');

function logChange(message) {
  const log = `${new Date().toISOString()} - ${message}\n`;
  fs.appendFileSync(logFile, log);
}

const server = http.createServer((req, res) => {
  logChange(`Request received: ${req.method} ${req.url}`);
  res.end('Hello, Newsitachi times now Platform! hio v8');
});

server.listen(3000, () => {
  console.log('Server running on port 3000');
});
