const { WebSocketServer } = require('ws');
const DHT = require('@hyperswarm/dht');
const { Relay } = require('@hyperswarm/dht-relay');
const ws = require('@hyperswarm/dht-relay/ws');

const main = () => {
  const dht = new DHT();

  Relay.fromTransport(ws, dht, new WebSocketServer({ port: 8080 }));

  console.log('Running a relay on port 8080');
};

module.exports = main;
