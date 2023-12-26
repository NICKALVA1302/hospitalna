const express = require("express");
const app = express();
const { WebhookClient } = require('dialogflow-fulfillment');
const mysql = require('mysql');
const dotenv = require('dotenv');
const TelegramBot = require('node-telegram-bot-api');

dotenv.config();
let validar_saludo=false;

// Configuración de la conexión a la base de datos MySQL con tus credenciales
const dbConnection = mysql.createConnection({
  host: 'mysql-nalvarez.alwaysdata.net',
  user: 'nalvarez',
  password: '039216685Aa!',
  database: 'nalvarez_recordatoriosbd',
});

// Realizar la conexión a la base de datos
dbConnection.connect((err) => {
  if (err) {
    console.error('Error en la conexión a la base de datos:', err);
  } else {
    console.log('Conexión a la base de datos establecida con éxito.');
  }
});

const telegramToken = '6908968073:AAGA0xx_RaXxzXOt_efC9u51kZkvlHQdoU4';
const bot = new TelegramBot(telegramToken, { polling: false });


async function Saludo(agent) {
  // obtenerTodosLosTelefonosYEnviarMensajes()
   validar_saludo=true;
   agent.add('¡Saludos! 🤖✨');
 }

app.get("/", (req, res) => {
  res.send("¡Bienvenido, estamos dentro!");
});

app.post("/webhook", express.json(), (request, response) => {
  const agent = new WebhookClient({ request, response });
  let intentMap = new Map();
  intentMap.set('Saludo', Saludo);
  agent.handleRequest(intentMap);
});

const PORT = 3000;

const server = app.listen(PORT, () => {
  console.log(`Servidor en ejecución en el puerto ${PORT}`);
});

// Manejar eventos de desconexión de la base de datos cuando se cierra el servidor
process.on('SIGINT', () => {
  dbConnection.end(); // Cierra la conexión a la base de datos al apagar el servidor
  console.log('Conexión a la base de datos cerrada debido a la terminación del proceso.');
  process.exit(0);
});
