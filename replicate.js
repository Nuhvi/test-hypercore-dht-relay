const Hypercore = require('hypercore');
const ram = require('random-access-memory');
const b4a = require('b4a');
const DHT = require('@hyperswarm/dht-relay');
const Stream = require('@hyperswarm/dht-relay/ws');
const WebSocket = require('isomorphic-ws');
const Hyperswarm = require('hyperswarm');

new WebSocket('ws://127.0.0.1:8080').onopen = (event) => {
  const dht = new DHT(new Stream(true, event.target));
  main(dht);
};

async function main(dht) {
  // Setting up Hyperswarm
  const swarm = new Hyperswarm({ dht });

  // Setting up Hypercore
  const core = new Hypercore(
    ram,
    b4a.from(
      '2e066532cc4f0f0ebaa8b09f19646ee0854aab3c80aa50356974996dac7999a1',
      'hex',
    ),
    { valueEncoding: 'json' },
  );
  await core.ready();

  console.log('Resolving core: ', b4a.toString(core.key, 'hex'));
  console.time('resolved in ');

  // Replicate on connection
  swarm.on('connection', async (conn) => {
    console.log('Got Connection, replicating ..');
    core.replicate(conn);
  });

  // Announcing the Hypercore
  swarm.join(core.discoveryKey, { server: false, client: true });

  await swarm.flush();
  await core.update();
  console.log('Core updated', core.length);

  const data = await core.get(core.length - 1);
  console.log('Success, Got data: ', data);
  console.timeEnd('resolved in ');

  process.exit?.();
}
