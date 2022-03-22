const Hypercore = require('hypercore');
const ram = require('random-access-memory');
const { createHash } = require('crypto');
const DHT = require('@hyperswarm/dht');
const Hyperswarm = require('hyperswarm');

const main = async ({ bootstrap }) => {
  // Setting up Hyperswarm
  const swarm = new Hyperswarm({
    bootstrap,
  });

  // Setting up Hypercore
  const keyPair = DHT.keyPair(createHash('sha256').update('foobar').digest());

  const core = new Hypercore(ram, {
    keyPair,
    valueEncoding: 'json',
  });
  await core.ready();

  // Replicate on connection
  swarm.on('connection', (conn) => {
    core.replicate(conn);
  });

  // Announcing the Hypercore
  await swarm
    .join(core.discoveryKey, { server: true, client: false })
    .flushed();

  await core.append({ foo: 'Bar' });
  await core.append({ foo: 'Zar' });

  console.log(
    'seeding core: ',
    core.key.toString('hex'),
    'length',
    core.length,
  );
};

module.exports = main;
