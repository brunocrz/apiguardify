const express = require('express');
const net = require('net');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();

// Usar o body-parser para interpretar o corpo da requisição
app.use(bodyParser.json());

// Cria rota raiz
app.get('/', (_, res) => {
  res.send('Bem vindo ao Guardify v1.0.0');
});

app.get('/items', async (req, res) => {
  try {
    // Faz uma solicitação GET para a API TCP para obter a lista de clientes
    console.log('Tentando obter lista de clientes da API TCP...');
    const response = await axios.get('http://localhost:3000/clients');
    console.log('Resposta recebida da API TCP:', response.data);
    
    const clients = response.data;
    res.json(clients);
  } catch (error) {
    console.error('Erro ao obter a lista de clientes da API TCP:', error.message);
    res.status(500).json({ error: 'Erro ao obter a lista de clientes da API TCP.' });
  }
});

// Escuta a porta
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API BUBBLE está ouvindo na porta ${PORT}`);
});
