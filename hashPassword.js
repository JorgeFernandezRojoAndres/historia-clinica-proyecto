// Importa bcryptjs
const bcrypt = require('bcryptjs');

// La contraseña que quieres hashear
const password = 'admin123'; 

// Genera el hash con bcrypt
const hashedPassword = bcrypt.hashSync(password, 10);

// Muestra el hash generado en la consola
console.log('Hash generado:', hashedPassword);

