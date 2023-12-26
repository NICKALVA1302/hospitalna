const express = require("express");
const { WebhookClient } = require('dialogflow-fulfillment');
const dotenv = require('dotenv');
const TelegramBot = require('node-telegram-bot-api');

dotenv.config();

const telegramToken = '6908968073:AAGA0xx_RaXxzXOt_efC9u51kZkvlHQdoU4';
const bot = new TelegramBot(telegramToken, { polling: false });

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("¡Bienvenido, estamos dentro!");
});

app.post("/", (req, res) => {
  const agent = new WebhookClient({ request: req, response: res });

  console.log('Dialogflow Request headers: ' + JSON.stringify(req.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(req.body));

});

const PORT = 8100;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor en ejecución en el puerto ${PORT}`);
});
