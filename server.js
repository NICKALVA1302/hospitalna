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
  agent.add('👋 Saludos! Soy 🤖 CuidaBOT ✨, tu asistente médico virtual. ¿En qué puedo ayudarte hoy?');
  agent.add('Por favor, ingresa tu número de cédula para continuar.');

  // Esperar la respuesta del usuario
  const respuestaUsuarioCedula = agent.query;

  // Verificar si la respuesta es un número de cédula válido
  const regexCedula = /\d{10}/;
  const matchCedula = respuestaUsuarioCedula.match(regexCedula);

  if (matchCedula) {
    const numeroCedula = matchCedula[0];

    // Consultar la tabla doctores usando el número de cédula
    try {
      const resultsDoctores = await consultarDoctores(numeroCedula);

      if (resultsDoctores.length > 0) {
        const respuestaDoctores = resultsDoctores[0].nombre; // Cambia "nombre" por el campo que quieras mostrar
        agent.add(`¡Bienvenido Dr(a). ${respuestaDoctores}!`);
      } else {
        agent.add('❌ Lo siento, no encontré información en la tabla de doctores para ese número de cédula.');
      }
    } catch (error) {
      agent.add(error.message);
    }
  } else {
    agent.add('❌ Por favor, ingresa un número de cédula válido con 10 dígitos numéricos.');
  }
}

async function consultarDoctores(numeroCedula) {
  try {
    // Realizar la consulta en la tabla de doctores usando el número de cédula
    const results = await dbQueryAsync('SELECT nombre FROM doctores WHERE cedula = ?', [numeroCedula]);
    return results;
  } catch (error) {
    console.error('Error al realizar la consulta en la tabla de doctores', error);
    throw new Error('Hubo un error al procesar tu solicitud en la tabla de doctores.');
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