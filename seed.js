const Corestore = require('corestore');
const ram = require('random-access-memory');
const { DHT } = require('dht-universal');
const Hyperswarm = require('hyperswarm');
const curve = require('noise-curve-ed');
const { createHash } = require('crypto');

const main = async () => {
  const dht = await DHT.create({});
  const swarm = new Hyperswarm({ dht });

  const corestore = new Corestore(ram);
  await corestore.ready();

  swarm.on('connection', (socket, info) => {
    corestore.replicate(socket);
  });

  const keyPair = curve.generateKeyPair(
    createHash('sha256').update('foobar').digest(),
  );
  const core = corestore.get({ storage: ram, valueEncoding: 'json', keyPair });
  await core.ready();

  const discovery = swarm.join(core.discoveryKey, {
    server: true,
    client: false,
  });
  await discovery.flushed();

  await core.append({ foo: 'bar' });
  await core.append({ foo: 'zar' });

  console.log(core.length);

  console.log('Sedding core:', core.key.toString('hex'));
};

module.exports = main;

main();
