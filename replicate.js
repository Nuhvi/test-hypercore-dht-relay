const ram = require('random-access-memory');
const b4a = require('b4a');
const { DHT } = require('dht-universal');
const Hyperswarm = require('hyperswarm');
const Corestore = require('corestore');

async function main() {
  const dht = await DHT.create();
  const swarm = new Hyperswarm({ dht });

  const corestore = new Corestore(ram);
  await corestore.ready();

  swarm.on('connection', (socket, info) => {
    corestore.replicate(socket);
  });

  const core = corestore.get({
    key: b4a.from(
      '2e066532cc4f0f0ebaa8b09f19646ee0854aab3c80aa50356974996dac7999a1',
      'hex',
    ),
    valueEncoding: 'json',
  });
  await core.ready();

  const discovery = swarm.join(core.discoveryKey, {
    client: true,
    server: false,
  });

  console.log('started discovery');
  await discovery.flushed();
  console.log('done discovery');
  console.log(swarm);
  await swarm.flush();
  console.log(swarm);
  console.log('swarm flush');

  // await core.update();
  // await core.update();

  // console.log(core.length);
  // await new Promise((resolve) => {
  //   core.get(0).then(()=>{

  //   });
  //   setTimeout(resolve, 3000);
  // });
  console.log(core.length);

  if (core.length > 0) {
    const data = await core.get(core.length - 1);
    console.log('Got data: ', data);
  } else {
    console.log('there is no  data');
  }

  swarm.destroy();
}

main();
