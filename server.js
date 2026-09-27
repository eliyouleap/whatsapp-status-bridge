const express = require('express');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const QRCode = require('qrcode');
const app = express();
app.use(express.json({limit: '50mb'}));
let sock;
let lastQR = null;

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState('auth');
  sock = makeWASocket({ auth: state });
  sock.ev.on('creds.update', saveCreds);
  sock.ev.on('connection.update', (update) => {
    const { connection, qr } = update;
    if(qr) lastQR = qr;
    if(connection === 'open') console.log('WHATSAPP CONNECTED!');
  });
}
connectToWhatsApp();

app.get('/', (req,res) => res.send('Bridge is Live. Go to /qr to link'));
app.get('/qr', async (req,res) => {
  if(!lastQR) return res.send('Wait 20 seconds and refresh. No QR yet.');
  try {
    const img = await QRCode.toDataURL(lastQR);
    res.send(`<html><body style="display:flex;justify-content:center;align-items:center;height:100vh;flex-direction:column"><h2>Scan with WhatsApp</h2><img src="${img}" style="width:350px;border:10px solid black"><script>setTimeout(()=>location.reload(),15000)</script></body></html>`);
  } catch(e){ res.send('Error '+e.message); }
});

app.post('/status', async (req,res) => {
  try {
    await sock.sendMessage('status@broadcast', { text: req.body.text || 'test' });
    res.json({ok:true});
  } catch(e){ res.status(500).json({error:e.message}); }
});

app.listen(process.env.PORT || 10000);
