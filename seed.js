import DHT from '@hyperswarm/dht';
import Hypercore from 'hypercore';
import ram from 'random-access-memory';
import { createHash } from 'crypto';

const main = async () => {
  const node = new DHT({ ephemeral: true });
  await node.ready();

  const keyPair = DHT.keyPair(createHash('sha256').update('foo').digest());

  const core = new Hypercore(ram, {
    valueEncoding: 'json',
    keyPair,
  });
  await core.ready();

  await core.append({ foo: 'bar' });

  const server = node.createServer();
  server.on('connection', (socket) => {
    socket.on('error', (error) => console.log(error.message));
    socket.pipe(core.replicate(false)).pipe(socket);
  });

  await node.announce(core.discoveryKey, node.defaultKeyPair).finished();
  await server.listen();

  console.log('seeding core: ', core.key.toString('hex'));
};

main();
