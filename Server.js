const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req,res) => res.send('Bot is running - need to setup WhatsApp'));

app.listen(PORT, () => console.log('running on '+PORT));
