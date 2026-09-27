const express = require('express');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode');

const app = express();
app.use(express.json({limit: '50mb'}));
let sock;

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState('auth');
  sock = makeWASocket({ auth: state, printQRInTerminal: true });
  sock.ev.on('creds.update', saveCreds);
  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;
    if(qr) { console.log('--- SCAN THIS QR IN WHATSAPP ---'); qrcode.generate(qr, {small: true}); }
    if(connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode!== DisconnectReason.loggedOut;
      if(shouldReconnect) connectToWhatsApp();
    } else if(connection === 'open') { console.log('WhatsApp Connected!'); }
  });
  sock.ev.on('messages.upsert', m => {
    console.log('Got message:', m.messages[0]?.message);
    // כאן תוכל להעביר את ההודעה ל-GPT
  });
}
connectToWhatsApp();

app.get('/', (req,res) => res.send(sock? 'Bridge Live & WhatsApp Ready' : 'Bridge Live - Waiting for QR in logs'));

app.post('/status', async (req,res) => {
  const { text, imageUrl } = req.body;
  if(!sock) return res.status(500).json({error: 'WhatsApp not connected yet - scan QR in Render logs'});
  try {
    await sock.sendMessage('status@broadcast', { text: text || 'Update from project' });
    res.json({ ok: true });
  } catch(e) { res.status(500).json({error: e.message}); }
});

const port = process.env.PORT || 10000;
app.listen(port, () => console.log('Live on ' + port));
