const express = require('express');
const net = require('net');
const bodyParser = require('body-parser');

const app = express();

// Usar o body-parser para interpretar o corpo da requisição
app.use(bodyParser.json());

const clients = {};

const handleConnection = socket => {
    console.log('Cliente se conectou.');

    let buffer = ''; // Buffer para armazenar dados recebidos
    let clientInfo = null; // Inicializa clientInfo fora dos eventos
    
    const isValidClientMessage = buffer => {
        const clientsPattern = /^@([a-zA-Z0-9]+)@([a-zA-Z0-9]{6,15})@([a-zA-Z0-9]+)$/;
    
        return clientsPattern.test(buffer);
    };    

    socket.on('data', data => {
       buffer += data.toString().trim(); // Adiciona os dados recebidos ao buffer
          // Se a mensagem corresponder ao padrão do clients
            if (isValidClientMessage(buffer)) {
                // Verifica se há uma mensagem completa terminada com '@'
                if (buffer.includes('@')) {
                    const parts = buffer.split('@');
                    if (parts.length >= 4) {
                        // Extrai os dados da mensagem
                        const macAddress = parts[1];
                        const uniqueId = parts[2];
                        const keepAlive = parts[3];

                        console.log(`MAC Address: ${macAddress}`);
                        console.log(`UniqueId: ${uniqueId}`);
                        console.log(`Keep Alive: ${keepAlive}`);
                        // Cria um objeto clientInfo com os dados extraídos
                        clientInfo = {
                            socket: socket,
                            macAddress: macAddress,
                            uniqueId: uniqueId,
                            keepAlive: keepAlive
                        };

                        // Adiciona o cliente à lista de clientes
                        clients[uniqueId] = clientInfo;
                        
                        // Verifica se o uniqueId está na lista de clients
                        if (clients[uniqueId]) {
                            // Limpa o buffer para receber novos dados
                            buffer = '';
                        } else {
                            // Se o uniqueId não está na lista de clients, desconecta o cliente
                            console.error(`Erro de autenticação: Cliente com uniqueId ${uniqueId} não autorizado.`);
                            socket.destroy();
                        }
                    }
                }
            } else {
                    // Se a mensagem não corresponder ao padrão do cliente físico,
                    // assume-se que é a API HTTP se conectando e permite a conexão
                    console.log('API HTTP se conectou automaticamente.');

                    // Enviar resposta de autenticação à API HTTP
                    buffer = ''; // Limpar o buffer após a resposta
            }
    });

    socket.on('error', err => {
        if (clientInfo && clientInfo.uniqueId) {
            console.error(`Erro com o cliente ${clientInfo.uniqueId}: ${err.message}`);
        } else {
            console.error('Erro na conexão com o cliente:', err.message);
        }
        removeClient(clientInfo);
    });

    socket.on('close', () => {
        if (clientInfo && clientInfo.uniqueId) {
            console.log(`Cliente ${clientInfo.uniqueId} desconectado.`);
            console.log(`Cliente ${clientInfo.uniqueId} removido da lista.`);
        } else {
            console.log('Cliente desconectado antes de enviar o ID único.');
        }
        removeClient(clientInfo);
    });
};

function removeClient(clientInfo) {
    if (clientInfo && clientInfo.uniqueId) {
        delete clients[clientInfo.uniqueId];

    } else {
        console.log(`Erro ao remover cliente da lista: ClienteInfo inválido.`);
    }
}


// Rota para obter a lista de clientes
app.get('/clients', (req, res) => {
    console.log('Requisição para /clients recebida.');
    console.log('Clientes no momento da resposta:', clients);
    res.json(clients);
  });

const server = net.createServer(handleConnection);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`API BUBBLE está ouvindo na porta ${PORT}`);
});
