const Hypercore = require('hypercore');
const ram = require('random-access-memory');
const b4a = require('b4a');
const DHT = require('@hyperswarm/dht-relay');
const Stream = require('@hyperswarm/dht-relay/ws');
const WebSocket = require('isomorphic-ws');

new WebSocket('ws://127.0.0.1:8080').onopen = (event) => {
  main(new DHT(new Stream(true, event.target)));
};

async function main(node) {
  await node.ready();

  const core = new Hypercore(
    ram,
    b4a.from(
      '2e066532cc4f0f0ebaa8b09f19646ee0854aab3c80aa50356974996dac7999a1',
      'hex',
    ),
    { valueEncoding: 'json' },
  );
  await core.ready();

  const query = node.lookup(core.discoveryKey);

  const connections = new Map();

  for await (const { peers } of query) {
    peers.forEach((peer) => {
      const pubKeyString = b4a.toString(peer.publicKey, 'hex');
      if (!connections.has(pubKeyString)) {
        console.log('Connecting to peer:', pubKeyString);
        const connection = node.connect(peer.publicKey);
        connections.set(pubKeyString, connection);
      }
    });
  }

  for (const connection of connections.values()) {
    console.log(
      'Replicating core from peer:',
      b4a.toString(connection.remotePublicKey, 'hex'),
    );

    connection.on('error', (error) => {
      console.log(error);
    });
    connection.pipe(core.replicate(true)).pipe(connection);
  }

  const data = await core.get(0, { timeout: 1000 });
  console.log('Got data: ', data);

  for (const connection of connections.values()) {
    connection.destroy();
  }
}
