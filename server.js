const express = require('express');
const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const QRCode = require('qrcode');
const app = express();
let qrImage = 'loading...';

async function start() {
  const { state, saveCreds } = await useMultiFileAuthState('/tmp/auth_info');
  const sock = makeWASocket({ auth: state, printQRInTerminal: false, browser: ['Bridge','Chrome','1.0'] });
  sock.ev.on('creds.update', saveCreds);
  sock.ev.on('connection.update', async (u) => {
    if(u.qr) {
      qrImage = await QRCode.toDataURL(u.qr);
      console.log('QR READY - go to /qr page');
    }
    if(u.connection === 'open') {
      console.log('CONNECTED!');
      qrImage = 'CONNECTED - you can delete /qr route';
    }
  });
}
start();

app.get('/', (req,res) => res.send('<a href="/qr">לחץ כאן לQR</a>'));
app.get('/qr', (req,res) => res.send(`<html><body style="display:flex;justify-content:center;align-items:center;height:100vh"><div><h1>סרוק בוואטסאפ:</h1><img src="${qrImage}" style="width:300px"/><br><button onclick="location.reload()">רענן QR</button></div></body></html>`));
app.listen(process.env.PORT || 10000);
