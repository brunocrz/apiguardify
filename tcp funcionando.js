const net = require('net');

const clients = {};

const handleConnection = socket => {
    console.log('Cliente se conectou.');

    let buffer = ''; // Buffer para armazenar dados recebidos
    let clientInfo = null; // Inicializa clientInfo fora dos eventos

    socket.on('data', data => {
        buffer += data.toString(); // Adiciona os dados recebidos ao buffer

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

                // Limpa o buffer para receber novos dados
                buffer = '';
            }
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
        } else {
            console.log('Cliente desconectado antes de enviar o ID único.');
        }
        removeClient(clientInfo);
    });
};

function removeClient(clientInfo) {
    if (clientInfo && clientInfo.uniqueId) {
        delete clients[clientInfo.uniqueId];
    }
}

const server = net.createServer(handleConnection);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`API BUBBLE está ouvindo na porta ${PORT}`);
});
