// config/database.js

const mysql = require('mysql2');
const config = require('./config').db; // Asegúrate de que la ruta es correcta para importar config.js

const connection = mysql.createConnection({
    host: config.options.host,
    user: config.username,
    database: config.database,
    password: config.password,
    port: 3306, // Asegúrate de que el puerto es correcto
    ssl: { 
        rejectUnauthorized: false // Esta opción desactiva la verificación del certificado SSL
    }
});

connection.connect(error => {
    if (error) {
        console.error('Error conectando a la base de datos:', error);
        return;
    }
    console.log('Conexión establecida con la base de datos');
});

module.exports = connection;
