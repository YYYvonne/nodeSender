const udp = require('dgram');
const client = udp.createSocket('udp4');

// for (let i = 0; i < 2; i++) {
// const char = String.fromCharCode(0x41 + i);
const char = '559895';
client.send(Buffer.from(char), 32000, '2.2.2.113');
// }

client.on('message', (msg) => {
  console.log(msg.toString());
  const copy = JSON.parse(JSON.stringify(msg.toString()));
  console.log(copy);
  if (msg.toString() !== copy) client.send(Buffer.from(char), 32000);
});

// const { effect, reactive } = require('@Vue/reactivity');

// const obj = reactive({ num: 1 });
// effect(() => {
//   console.log(obj.num);
// });
// setInterval(() => {
//   ++obj.num;
// }, 1000);

client.on('listen', () => {
  socket.setBroadcast(true);
  socket.setMulticastTTL(128);
  socket.addMembership('239.255.255.250');
});

var strongPasswordChecker = function (password) {
  console.log('object');
  if (password.length < 6 || password.length > 20) return;
  const reg = new RegExp('/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])$/');
  if (!reg.test(password)) return;
  for (let i of password) {
    console.log(i);
  }
};

strongPasswordChecker('1525Dddd');
