// config/database.js

const mysql = require('mysql2');
const config = require('./config').db; // Asegúrate de que la ruta es correcta para importar config.js

const connection = mysql.createConnection({
    host: config.options.host,
    user: config.username,
    database: config.database,
    password: config.password
});

connection.connect(error => {
    if (error) {
        console.error('Error conectando a la base de datos:', error);
        return;
    }
    console.log('Conexión establecida con la base de datos');
});

module.exports = connection;
