const express = require('express');
const app = express();
app.use(express.json({limit: '50mb'}));

app.get('/', (req,res) => res.send('Bridge is Live - Ready for status'));

app.post('/status', async (req,res) => {
  // כאן יגיע התמונה/טקסט מהאוטומציה שלך
  console.log('Received status request', Object.keys(req.body));
  // כרגע זה רק מדפיס ללוג - בשלב הבא נחבר את הוואטסאפ
  res.json({ ok: true, message: 'Received - WhatsApp connection next' });
});

const port = process.env.PORT || 10000;
app.listen(port, () => console.log('Live on ' + port));
