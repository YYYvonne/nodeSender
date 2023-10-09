const dgram = require('dgram');
//这是读取数据时需要的解析
const fs = require('fs');
const findData = JSON.parse(fs.readFileSync('./findData.json', 'utf8'));
const locateData = JSON.parse(fs.readFileSync('./locateData.json', 'utf8'));
const authData = JSON.parse(fs.readFileSync('./authData.json', 'utf-8'));
const netData = JSON.parse(fs.readFileSync('./netData.json', 'utf-8'));
const webData = JSON.parse(fs.readFileSync('./webData.json'));

//receive msg
const socket = dgram.createSocket('udp4');
let ip = '192.168.1.113';
const PORT = 32000;
let pwdArr = [];

//这是解密的函数
const decrypt = require('./decrypt');

// Join multicast group
socket.on('message', function (msg, rinfo) {
  console.log('查看发送地址', rinfo);
  let getMsg = null;
  try {
    getMsg = JSON.parse(msg.toString());
  } catch (err) {
    if (err) {
      const data = decrypt.decrypt(msg.toString());
      getMsg = JSON.parse(data);
    }
  }

  console.log('这是得到的请求数据', getMsg);

  if (getMsg.uri === '/query') {
    //这是发现数据的处理
    for (let i in findData) {
      const buf = Buffer.from(JSON.stringify(findData[i]));
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
      }
    }
  }

  //这是授权数据的处理
  let originPwd = 'admin';
  let originUser = 'admin';
  function getArr() {
    let arr = [];
    Object.values(authData).forEach((i) => {
      if (i.uri === '/auth_ack') {
        const data = {};
        data.originPwd = originPwd;
        data.originUser = originUser;
        data.mac = i.mac;
        arr.push(data);
      }
      if (arr.length) pwdArr = JSON.parse(JSON.stringify(arr));
    });
  }

  if (getMsg.uri === '/auth') {
    let _name = getMsg.targets[0].username;
    let _pwd = getMsg.targets[0].encrypted_pwd;
    const data = 'admin';
    Object.values(authData).forEach((i) => {
      let buf = Buffer.from(JSON.stringify(i));
      getArr();
      if (getMsg.targets[0].mac === i.mac) {
        if (_name !== data || _pwd !== data)
          i.uri === '/auth_nak'
            ? socket.send(buf, 0, buf.length, rinfo.port, rinfo.address)
            : '';
        //when the data is successful
        if (_name === data && _pwd === data)
          i.uri === '/auth_ack'
            ? socket.send(buf, 0, buf.length, rinfo.port, rinfo.address)
            : '';
      }
    });
  }

  //开启web服务
  if (getMsg.uri === '/config/web') {
    let data = {};
    Object.values(webData).map((item) => {
      if (getMsg.targets[0].token && getMsg.targets[0].token !== 'null') {
        if (getMsg.targets[0].mac === item.mac && item.uri === '/config_ack')
          data = item;
      } else {
        if (getMsg.targets[0].mac === item.mac && item.uri === '/config_nak')
          data = item;
      }
    });

    const buf = Buffer.from(JSON.stringify(data));
    socket.send(buf, 0, buf.length, rinfo.port, rinfo.address);
  }

  //这是配置操作
  if (getMsg.uri === '/config/mgmtip') {
    if (getMsg.targets[0].token && getMsg.targets[0].token !== 'null') {
      Object.values(findData).map((i) => {
        if (i.mac === getMsg.targets[0].mac) {
          i.mgmtip.ip = getMsg.targets[0].mgmtip.ip;
          i.mgmtip.prefix = getMsg.targets[0].mgmtip.prefix;
          i.mgmtip.gateway = getMsg.targets[0].mgmtip.gateway;
        }
      });
      Object.values(netData).map((i) => {
        let buf = Buffer.from(JSON.stringify(i));
        if (i.mac === getMsg.targets[0].mac && i.uri === '/config_ack')
          socket.send(buf, 0, buf.length, rinfo.port, rinfo.address);
      });
      fs.writeFileSync('./findData.json', JSON.stringify(findData), (err) => {
        if (err) throw err;
      });
    } else
      Object.values(netData).map((i) => {
        let buf = Buffer.from(JSON.stringify(i));
        if (i.mac === getMsg.targets[0].mac && i.uri === '/config_nak')
          socket.send(buf, 0, buf.length, rinfo.port, rinfo.address);
      });
  }
});

socket.on('error', (error) => {
  console.log(error);
  socket.close();
});

socket.bind(PORT, ip);
