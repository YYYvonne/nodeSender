const { json } = require('body-parser');
const udp = require('dgram');
const client = udp.createSocket('udp4');

// for (let i = 0; i < 2; i++) {
// const char = String.fromCharCode(0x41 + i);
const char = '559895';
client.send(Buffer.from(char), 32000);
// }

client.on('message', (msg) => {
  console.log(msg.toString());
  const copy = JSON.parse(JSON.stringify(msg.toString()));
  console.log(copy);
  if (msg.toString() !== copy) client.send(Buffer.from(char), 32000);
});
