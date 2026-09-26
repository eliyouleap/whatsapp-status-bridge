const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const auth = require('basic-auth');
const app = express();
app.use(express.json());

const USER = process.env.USER || 'admin';
const PASS = process.env.PASS || 'change-me';
const MY_NUMBER = process.env.MY_NUMBER || '972528400085@c.us'; // המספר שלך

const checkAuth = (req, res, next) => {
    const cred = auth(req);
    if (!cred || cred.name !== USER || cred.pass !== PASS) {
        res.status(401).set('WWW-Authenticate', 'Basic realm="whatsapp"').end('Access denied');
    } else { next(); }
};

const client = new Client({ 
    authStrategy: new LocalAuth(),
    puppeteer: { args: ['--no-sandbox', '--disable-setuid-sandbox'] }
});

client.on('qr', qr => console.log('QR CODE TO SCAN:', qr));
client.on('ready', () => console.log('✅ WhatsApp Ready!'));
client.initialize();

// זה הנתיב ש-ChatGPT יקרא לו
app.post('/chatgpt-status', checkAuth, async (req, res) => {
    const { task, status, details } = req.body;
    const msg = `🤖 *עדכון מ-ChatGPT*\n\n📋 משימה: ${task}\n📌 סטטוס: ${status}\n${details ? `\n📝 פרטים: ${details}` : ''}`;
    try {
        await client.sendMessage(MY_NUMBER, msg);
        res.json({ ok: true, sent_to: MY_NUMBER });
    } catch(e) {
        res.status(500).json({ ok: false, error: e.message });
    }
});

app.get('/', (req, res) => res.send('Bot is running. Use /chatgpt-status'));

app.listen(process.env.PORT || 3000);
