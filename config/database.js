const mysql = require('mysql2');
const config = require('./config').db; // Asegúrate de que la ruta es correcta para importar config.js

// Crear un pool de conexiones
const pool = mysql.createPool({
    host: config.options.host, // 'localhost'
    user: config.username, // 'root'
    database: config.database, // Tu base de datos en XAMPP
    password: config.password, // Generalmente vacío en XAMPP
    port: 3306, // Puerto por defecto de XAMPP
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
