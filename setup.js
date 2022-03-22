const setupRelay = require('./relay.js');
const setupSeeder = require('./seed.js');
const { setupTestnet } = require('./testnet.js');

(async () => {
  const { bootstrap } = await setupTestnet();
  setupRelay({ bootstrap });
  await setupSeeder({ bootstrap });
})();
