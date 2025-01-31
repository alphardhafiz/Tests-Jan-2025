const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', function connection(ws) {
  console.log('New client connected');

  ws.on('message', function incoming(message) {
    try {
      const parsedMessage = JSON.parse(message);
      
      if (!parsedMessage.text || !parsedMessage.sender) {
        console.error('Invalid message format:', message);
        return;
      }

      console.log(`Received message from ${parsedMessage.sender}: ${parsedMessage.text}`);

      wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(parsedMessage));
        }
      });
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  ws.on('close', function close() {
    console.log('Client disconnected');
  });

  ws.on('error', function error(err) {
    console.error('WebSocket error:', err);
  });
});

console.log('WebSocket server is running on port 8080');
