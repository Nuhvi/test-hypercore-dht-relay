const { WebSocketServer } = require('ws');
const DHT = require('@hyperswarm/dht');
const { relay } = require('@hyperswarm/dht-relay');
const Stream = require('@hyperswarm/dht-relay/ws');

const main = () => {
  const server = new WebSocketServer({ port: 8080 });

  server.on('connection', (socket) => {
    relay(new DHT(), new Stream(false, socket));
    console.log('Running a relay on port 8080');
  });
};

module.exports = main;
