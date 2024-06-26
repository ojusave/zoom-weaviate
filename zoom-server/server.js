const express = require('express');
const bodyParser = require('body-parser');
const { handleBotEvent } = require('./emailAPI');

const app = express();
const port = process.env.PORT || 4000;

app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('OK');
});

app.post('/chatbot', handleBotEvent);

app.listen(port, () => console.log(`Listening at http://localhost:${port}`));
