const dgram = require('dgram');
let bufList = [];

const findData = {
  data1: {
    protocol: 'dkconf1.0',
    uri: '/query_ack',
    pktid: 1,
    status: 200,
    mgmtip: {
      vid: 1,
      ip: '2.2.2.95',
      prefix: 24,
      gateway: '2.2.2.1',
    },
    mac: '00d0f8880001',
    productId: 'abc',
    sw_ver: 'release/1.0.0',
    hw_ver: 'v1.00',
    uptime: 100,
  },
  data2: {
    protocol: 'dkconf1.0',
    uri: '/query_ack',
    pktid: 1,
    status: 200,
    mgmtip: { vid: 1, ip: '3.3.3.95', prefix: 8, gateway: '2.2.2.1' },
    mac: '00d0f9990001',
    productId: 'def',
    sw_ver: 'release/1.0.0',
    hw_ver: 'v1.00',
    uptime: 500000,
  },
  data3: {
    protocol: 'dkconf1.0',
    uri: '/query_ack',
    pktid: 1,
    status: 200,
    mgmtip: {
      vid: 1,
      ip: '4.4.4.95',
      prefix: 16,
      gateway: '2.2.2.1',
    },
    mac: '00d0f7770001',
    productId: 'ghi',
    sw_ver: 'release/1.0.0',
    hw_ver: 'v1.00',
    uptime: 500,
  },
};
const locateData = {
  data1: {
    protocol: 'dkconf1.0',
    uri: '/find_ack',
    pktid: 1,
    mac: '00d0f8880001',
    msg: 'the led blinks for 3 seconds',
  },
  error1: {
    protocol: 'dkconf1.0',
    uri: '/find_nak',
    pktid: 1,
    mac: '00d0f8880001',
    msg: 'unsupported',
  },
  data2: {
    protocol: 'dkconf1.0',
    uri: '/find_ack',
    pktid: 1,
    mac: '00d0f7770001',
    msg: 'the led blinks for 3 seconds',
  },
  error2: {
    protocol: 'dkconf1.0',
    uri: '/find_nak',
    pktid: 1,
    mac: '00d0f7770001',
    msg: 'unsupported',
  },
  data3: {
    protocol: 'dkconf1.0',
    uri: '/find_ack',
    pktid: 1,
    mac: '00d0f6660001',
    msg: 'the led blinks for 3 seconds',
  },
  error3: {
    protocol: 'dkconf1.0',
    uri: '/find_nak',
    pktid: 1,
    mac: '00d0f6660001',
    msg: 'unsupported',
  },
};

//receive msg
const socket = dgram.createSocket('udp4');
const MULTICAST_ADDR = '239.255.255.250';
const PORT = 32000;

// Join multicast group
socket.on('message', function (msg, rinfo) {
  console.log('server接收到消息', msg.toString());
  const getMsg = JSON.parse(msg.toString());
  console.log(getMsg);

  // 这是发现的数据发送与处理

  if (getMsg.uri === '/query') {
    const buf3 = Buffer.from(JSON.stringify(findData.data3));
    const buf2 = Buffer.from(JSON.stringify(findData.data2));
    const buf1 = Buffer.from(JSON.stringify(findData.data1));
    bufList = [buf1, buf2, buf3];
    for (let i = 0; i < bufList.length; i++) {
      const buf = bufList[i];
      socket.send(buf, 0, buf.length, rinfo.port, rinfo.address);
    }
  }

  // 这是定位的发现处理
  if (getMsg.uri === '/find') {
    const buf1 = Buffer.from(JSON.stringify(locateData.data1));
    const buf2 = Buffer.from(JSON.stringify(locateData.data2));
    const buf3 = Buffer.from(JSON.stringify(locateData.data3));
    bufList = [buf1, buf2, buf3];
    for (let i = 0; i < bufList.length; i++) {
      const buf = bufList[i];
      socket.send(buf, 0, buf.length, rinfo.port, rinfo.address);
    }
  }
});

socket.on('listening', () => {
  console.log('服务端监听到数据');
  socket.setBroadcast(true);
  socket.setMulticastTTL(128);
  socket.addMembership(MULTICAST_ADDR);
});

socket.on('error', (error) => {
  console.log(error);
  socket.close();
});

socket.bind(PORT);
