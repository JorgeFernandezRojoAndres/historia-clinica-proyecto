const socketIo = require('socket.io');

// Inicializar socket.io
let io;

function init(server) {
    io = socketIo(server);
    io.on('connection', (socket) => {
        console.log('Nueva conexión de WebSocket');
        socket.on('disconnect', () => {
            console.log('Cliente desconectado');
        });
    });
}

// Función para enviar notificaciones a la secretaria
function enviarNotificacionAScretaria(mensaje) {
    if (io) {
        io.emit('nuevaCita', mensaje); // Emitir un evento a todos los clientes conectados
        console.log('Notificación enviada:', mensaje);
    } else {
        console.error('Socket.io no está inicializado');
    }
}

module.exports = {
    init,
    enviarNotificacionAScretaria
};
