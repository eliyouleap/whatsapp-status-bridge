const express = require('express');
const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const app = express();

async function start() {
  const { state, saveCreds } = await useMultiFileAuthState('auth');
  const sock = makeWASocket({ auth: state, printQRInTerminal: true, browser: ['Ubuntu','Chrome','22.04'] });
  sock.ev.on('creds.update', saveCreds);
  
  // תבקש קוד
  if(!state.creds.registered) {
    await new Promise(r => setTimeout(r, 5000));
    const code = await sock.requestPairingCode('9725XXXXXXXX'); // <--- תשנה למספר שלך בלי 0 בהתחלה
    console.log('YOUR PAIRING CODE IS: ' + code);
  }
}
start();

app.get('/', (req,res) => res.send('Check logs for pairing code'));
app.listen(process.env.PORT || 10000);
