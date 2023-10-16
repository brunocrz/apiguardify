const net = require('net');

const client = new net.Socket();

// Defina o ID único que deseja enviar após a conexão
const uniqueId = "@110033885577@CLIENTE2@0000";

// Estabelecer Conexão TCP:
client.connect(3000, 'localhost', () => {
    console.log('Conectado a API TCP');
    
    // Envia o ID único após a conexão
    client.write(uniqueId);
});

// Receber Dados da API tcp
client.on('data', data => {
    const receivedData = data.toString();
    console.log('Recebido da API TCP: ' + receivedData);
    // Lógica para lidar com os dados recebidos, se necessário
});

client.on('close', () => {
    console.log('Conexão TCP fechada');
});

client.on('error', error => {
    console.error('Erro na conexão TCP: ' + error.message);
});
