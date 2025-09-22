const mysql = require('mysql2');
const config = require('./config').db;

const pool = mysql.createPool({
  host: config.host,
  user: config.username,
  database: config.database,
  password: config.password,
  port: config.port,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

pool.getConnection((error, connection) => {
  if (error) {
    console.error('Error conectando a la base de datos:', error);
    return;
  }
  if (connection) connection.release();
  console.log('Conexión establecida con el pool');
});

module.exports = pool;
