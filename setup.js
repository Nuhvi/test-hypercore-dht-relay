const setupRelay = require('./relay.js');
const setupSeeder = require('./seed.js');

(async () => {
  setupRelay();
  await setupSeeder();
})();
