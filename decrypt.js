const CryptoJS = require('crypto-js');

const key = CryptoJS.enc.Utf8.parse('1234567890000000');
const iv = CryptoJS.enc.Utf8.parse('1234567890000000');

function decrypt(word) {
  const encryptedHexStr = CryptoJS.enc.Hex.parse(word);
  const data = CryptoJS.enc.Base64.stringify(encryptedHexStr);
  const decrypt = CryptoJS.AES.decrypt(data, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  const decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);
  return decryptedStr.toString();
}

module.exports = {
  decrypt: decrypt,
};
