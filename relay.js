const { WebSocketServer } = require('ws');
const DHT = require('@hyperswarm/dht');
const { relay } = require('@hyperswarm/dht-relay');
const Stream = require('@hyperswarm/dht-relay/ws');

const main = ({ bootstrap }) => {
  const server = new WebSocketServer({ port: 8080 });
  const node = new DHT({ bootstrap });

  console.log('Running a relay on port 8080');

  server.on('connection', (socket) => {
    relay(node, new Stream(false, socket));
  });
};

module.exports = main;
