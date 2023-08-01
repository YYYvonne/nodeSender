const dgram = require('dgram');
let bufList = [];

const fs = require('fs');
const findData = JSON.parse(fs.readFileSync('./findData.json', 'utf8'));
const locateData = JSON.parse(fs.readFileSync('./locateData.json', 'utf8'));
const authData = JSON.parse(fs.readFileSync('./authData.json', 'utf-8'));

//receive msg
const socket = dgram.createSocket('udp4');
const MULTICAST_ADDR = '239.255.255.250';
const PORT = 32000;

// Join multicast group
socket.on('message', function (msg, rinfo) {
  console.log('server接收到消息', msg.toString());
  const getMsg = JSON.parse(msg.toString());
  console.log(getMsg);

  //这是发现数据的处理
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

  // 这是定位的数据发送与处理
  if (getMsg.uri === '/find') {
    for (let i in locateData) {
      if (getMsg.targets[0].mac === locateData[i].mac) {
        // response in success
        if (locateData[i].uri === '/find_ack') {
          const buf = Buffer.from(JSON.stringify(locateData[i]));
          socket.send(buf, 0, buf.length, rinfo.port, rinfo.address);
        }
        // else {
        //response in error
        //   console.log('erro when send this msg', locateData[i]);
        // if (locateData[i].uri === '/find_nck') {
        //   const buf = Buffer.from(JSON.stringify(locateData[i]));
        //   socket.send(buf, 0, buf.length, rinfo.port, rinfo.address);
        // }
      }
    }
  }

  //这是授权数据的处理

  if (getMsg.uri === '/auth') {
    let _name = getMsg.targets[0].username;
    let _pwd = getMsg.targets[0].encrypted_pwd;
    if (_name != 'admin' || _pwd != 'admin') {
      //when the data is error
      for (let i in authData) {
        if (authData.targets[0].mac === authData[i].mac) {
          if (authData[i].uri === '/auth_nck') {
            const buf = Buffer.from(JSON.stringify(authData[i]));
            socket.send(buf, 0, buf.length, rinfo.port, rinfo.address);
          }
        }
      }
    }
  }

  //when the data is successful
  if (getMsg.uri === '/auth') {
    for (let i in authData) {
      if (authData.targets[0].mac === authData[i].mac) {
        if (authData[i].uri === '/auth_ack') {
          const buf = Buffer.from(JSON.stringify(authData[i]));
          socket.send(buf, 0, buf.length, rinfo.port, rinfo.address);
        }
      }
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
