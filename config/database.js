const mysql = require('mysql2');
const config = require('./config').db; // Asegúrate de que la ruta es correcta para importar config.js

// Crear un pool de conexiones
const pool = mysql.createPool({
    host: config.options.host,
    user: config.username,
    database: config.database,
    password: config.password,
    port: 3306,
    ssl: { 
        rejectUnauthorized: false 
    },
    waitForConnections: true,
    connectionLimit: 10,  // Número máximo de conexiones simultáneas
    queueLimit: 0  // No limitar las solicitudes en cola
});

// Verificar que la conexión sea exitosa
pool.getConnection((error, connection) => {
    if (error) {
        console.error('Error conectando a la base de datos:', error);
        return;
    }
    if (connection) connection.release();
    console.log('Conexión establecida con el pool');
});

module.exports = pool;
