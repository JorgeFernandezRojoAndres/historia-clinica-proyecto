const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'jorge007',
  database: 'medicappdb',
  port: 3306
});

connection.connect((err) => {
  if (err) {
    console.error('❌ Error de conexión:', err);
    return;
  }
  console.log('✅ Conexión exitosa a MySQL');
  connection.end();
});
