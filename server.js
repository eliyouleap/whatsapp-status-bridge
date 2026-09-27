const express = require('express');
const { default: makeWASocket, useMultiFileAuthState, delay } = require('@whiskeysockets/baileys');
const app = express();
app.use(express.json({limit:'50mb'}));

let sock;

async function start() {
  const { state, saveCreds } = await useMultiFileAuthState('/tmp/auth_info');
  sock = makeWASocket({ 
    auth: state, 
    printQRInTerminal: false,
    browser: ['Chrome','Chrome','110']
  });
  sock.ev.on('creds.update', saveCreds);
  sock.ev.on('connection.update', async (update) => {
    console.log(update);
    if(update.connection === 'open') {
      console.log('✅ CONNECTED SUCCESSFULLY! YOU CAN NOW USE THE BRIDGE');
    }
  });

  if(!state.creds.registered) {
    await delay(3000);
    try {
      const code = await sock.requestPairingCode('972528400085');
      console.log('=================================');
      console.log('PAIRING CODE IS: ' + code);
      console.log('=================================');
    } catch(e) {
      console.log('PAIRING ERROR: ' + e.message);
    }
  }
}

start();

app.get('/', (req,res) => res.send('Bridge is running - check logs for pairing code'));
app.get('/status', (req,res) => res.send('OK - ' + (sock ? 'sock exists' : 'no sock')));

app.listen(process.env.PORT || 10000, () => console.log('Server up'));
