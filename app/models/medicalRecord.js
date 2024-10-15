// models/medicalRecord.js
const db = require('../../config/database'); // Asegúrate de que la ruta es correcta

const MedicalRecord = {
    create(record) {
        return new Promise((resolve, reject) => {
            const sql = "INSERT INTO medical_records (pacientesName, condition, treatment, dateOfVisit, notes) VALUES (?, ?, ?, ?, ?)";
            db.query(sql, [record.pacientesName, record.condition, record.treatment, record.dateOfVisit, record.notes], (error, results) => {
                if (error) {
                    console.error('Error al insertar en la base de datos:', error);
                    reject(new Error('Error al insertar el registro médico.'));
                } else {
                    resolve(results.insertId);
                }
            });
        });
    },
    // Agrega aquí más métodos CRUD como buscar, actualizar y eliminar
};

module.exports = MedicalRecord;
