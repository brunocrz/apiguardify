const express = require('express');
const net = require('net');
const bodyParser = require('body-parser');

const app = express();

// Usar o body-parser para interpretar o corpo da requisição
app.use(bodyParser.json());

// Cria rota raiz
app.get('/', (_, res) => {
  res.send('Bem vindo ao Guardify v1.0.0');
});

// Cria a rota solicitar
app.post('/solicitar', (req, res) => {
  const client = new net.Socket();
  
  // Pega a mensagem do corpo da requisição POST
  const dataToSend = req.body.message; // 'message' é o nome do campo no corpo da requisição POST

  client.connect(3000, 'localhost', () => { // Abre conexão com a api tcp.js
    console.log('Conectado ao servidor TCP');
    client.write(dataToSend); // Envia os dados para o api TCP
  });

  // Recebe respostas da api tcp.js
  client.on('data', data => {
    console.log('Recebido do servidor TCP: ' + data);
    res.send(data); // Envia a resposta do servidor TCP de volta ao cliente HTTP que fez a requisição
    client.destroy(); // Encerra a conexão após receber a resposta
  });

  client.on('close', () => {
    console.log('Conexão TCP fechada');
  });
});

// Escuta a porta
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API BUBBLE está ouvindo na porta ${PORT}`);
});
