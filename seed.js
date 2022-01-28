const DHT = require('@hyperswarm/dht');
const Hypercore = require('hypercore');
const ram = require('random-access-memory');
const { createHash } = require('crypto');

const main = async () => {
  const node = new DHT({ ephemeral: true });
  await node.ready();

  const keyPair = DHT.keyPair(createHash('sha256').update('foobar').digest());

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

module.exports = main;
