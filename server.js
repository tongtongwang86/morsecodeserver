const WebSocket = require('ws');
const express = require('express');
const http = require('http');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static(path.join(__dirname, 'public')));

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(data) {
    let message = null;
    try {
      message = JSON.parse(data);
    } catch (e) {
      return;
    }
    const payload = JSON.stringify({
      type: 'symbol',
      name: message.name,
      symbol: message.symbol
    });
    

    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN && client !== ws) {
        client.send(payload);
      }
    });
  });
});

server.listen(3000, '0.0.0.0', () => {
  console.log('Server started on http://0.0.0.0:3000');
});
