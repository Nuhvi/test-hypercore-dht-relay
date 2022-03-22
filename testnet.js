const DHT = require('@hyperswarm/dht');

module.exports.setupTestnet = async (opts) => {
  const node = new DHT({
    ephemeral: true,
    bootstrap: [],
  });
  await node.ready();

  const nodes = [node];

  const bootstrap = [{ host: '127.0.0.1', port: node.address().port }];

  for (let i = 1; i < 4; i++) {
    const dht = (nodes[i] = new DHT({ ephemeral: false, bootstrap }));
    await dht.ready();
  }

  console.log('Bootstrap: ', bootstrap);

  return { bootstrap };
};
