import { Node } from '@hyperswarm/dht-relay';
import ws from '@hyperswarm/dht-relay/ws';
import Hypercore from 'hypercore';
import ram from 'random-access-memory';
import b4a from 'b4a';
import WebSocket from 'isomorphic-ws';

export class DHT extends Node {
  constructor(opts) {
    const websocket = new WebSocket('wss://dht-relay.synonym.to');

    super(new ws.Socket(websocket), null);
  }
}

const main = async () => {
  const node = new DHT();
  await node.ready();

  const core = new Hypercore(
    ram,
    b4a.from(
      '34d26579dbb456693e540672cf922f52dde0d6532e35bf06be013a7c532f20e0',
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
        const connection = node.connect(peer.publicKey);
        connections.set(pubKeyString, connection);
      }
    });
  }

  for (const connection of connections.values()) {
    connection.on('error', (error) => {
      console.log(error);
    });
    connection.pipe(core.replicate(true)).pipe(connection);
  }

  const data = await core.get(0, { timeout: 1000 });
  console.log('got data: ', data);

  for (const connection of connections.values()) {
    connection.destroy();
  }
};

main();
