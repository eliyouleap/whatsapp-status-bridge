const express = require('express');
const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const app = express();
app.use(express.json({limit:'50mb'}));
let sock;

async function start() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info');
  sock = makeWASocket({ auth: state, printQRInTerminal: false });
  sock.ev.on('creds.update', saveCreds);
  sock.ev.on('connection.update', async (u) => {
    if(u.connection === 'open') console.log('CONNECTED SUCCESSFULLY!');
    if(!state.creds.registered) {
      await new Promise(r=>setTimeout(r,4000));
      try {
        let code = await sock.requestPairingCode('972528400085');
        console.log('====================');
        console.log('PAIRING CODE: ' + code);
        console.log('====================');
      } catch(e){
