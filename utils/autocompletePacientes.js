const db = require('../config/database'); // Ajusta la ruta si es necesario

async function buscarPacientes(query) {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT idPaciente, nombre 
            FROM pacientes 
            WHERE nombre LIKE ?
            LIMIT 10
        `;
        const searchTerm = `%${query}%`;

        db.query(sql, [searchTerm], (error, results) => {
            if (error) {
                console.error('Error al buscar pacientes:', error);
                return reject(error);
            }
            const pacientes = results.map(paciente => ({
                id: paciente.idPaciente,
                nombre: paciente.nombre
            }));
            resolve(pacientes);
        });
    });
}

module.exports = buscarPacientes;
