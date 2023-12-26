const express = require("express");
const app = express();
const { WebhookClient } = require('dialogflow-fulfillment');
const mysql = require('mysql');
const dotenv = require('dotenv');
const TelegramBot = require('node-telegram-bot-api');

dotenv.config();

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

app.get("/", (req, res) => {
  res.send("¡Bienvenido, estamos dentro!");
});

app.post("/webhook", express.json(), (request, response) => {
  const agent = new WebhookClient({ request, response });

  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));

  // Obtener el texto del usuario desde Dialogflow
  const textoUsuario = agent.query;

  // Realizar una consulta en la base de datos
  dbConnection.query('SELECT respuesta FROM bot_Saludo WHERE texto_usuario = ?', [textoUsuario], (error, results) => {
    if (error) {
      console.error('Error al realizar la consulta en la base de datos', error);
      agent.add('Hubo un error al procesar tu solicitud.');
    } else {
      const rows = results;
      if (rows.length > 0) {
        // Si se encuentra una respuesta en la base de datos, respóndela al usuario
        const respuesta = rows[0].respuesta;
        agent.add(respuesta);
      } else {
        // Si no se encuentra una respuesta en la base de datos, proporciona una respuesta predeterminada
        agent.add('Lo siento, no tengo una respuesta para eso.');
      }
    }
    // Cerrar la respuesta del webhook
    response.json({ fulfillmentText: "¡Webhook recibido exitosamente!" });
  });
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
