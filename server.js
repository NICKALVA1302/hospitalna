const express = require("express");
const app = express();
const { WebhookClient } = require('dialogflow-fulfillment');
const mysql = require('mysql');
const dotenv = require('dotenv');
const TelegramBot = require('node-telegram-bot-api');
const util = require('util');

dotenv.config();
let validar_saludo = false;

// Configuración de la conexión a la base de datos MySQL con tus credenciales
const dbConnection = mysql.createConnection({
  host: 'mysql-hospitalbot.alwaysdata.net',
  user: '341462',
  password: '039216685Aa!',
  database: 'hospitalbot_bot',
});

// Realizar la conexión a la base de datos
dbConnection.connect((err) => {
  if (err) {
    console.error('Error en la conexión a la base de datos:', err);
  } else {
    console.log('Conexión a la base de datos establecida con éxito.');
  }
});

// Promisificar la función de consulta para poder utilizar async/await
const dbQueryAsync = util.promisify(dbConnection.query).bind(dbConnection);

async function SaludoBD(textoUsuario) {
  try {
    const results = await dbQueryAsync('SELECT saludo_respuesta FROM bot_Saludo WHERE saludo_texto_usuario = ?', [textoUsuario]);
    return results;
  } catch (error) {
    console.error('Error al realizar la consulta en la base de datos', error);
    throw new Error('Hubo un error al procesar tu solicitud.');
  }
}

async function Saludo(agent) {
  validar_saludo = true;
  agent.add('¡Saludos! 🤖✨');

  const textoUsuario = agent.query;

  try {
    const results = await SaludoBD(textoUsuario);

    const rows = results;
    if (rows.length > 0) {
      const respuesta = rows[0].respuesta;
      agent.add(respuesta);
    } else {
      agent.add('Lo siento, no tengo una respuesta para eso.');
    }
  } catch (error) {
    agent.add(error.message);
  }
}

app.get("/", (req, res) => {
  res.send("¡Bienvenido, estamos dentro!");
});

app.post("/", express.json(), (request, response) => {
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