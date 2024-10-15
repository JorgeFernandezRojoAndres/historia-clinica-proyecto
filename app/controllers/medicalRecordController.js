// controllers/medicalRecordController.js
const db = require('../config/database');  // Ajusta la ruta según sea necesario.

const MedicalRecord = require('../models/medicalRecord');

// Función para crear un nuevo registro médico
exports.addMedicalRecord = (req, res) => {
    const newRecord = {
        pacientesName: req.body.pacientesName,
        condition: req.body.condition,
        treatment: req.body.treatment,
        dateOfVisit: req.body.dateOfVisit || new Date(),
        notes: req.body.notes
    };

    MedicalRecord.create(newRecord, (insertId) => {
        res.status(201).send({ message: "Registro médico creado con éxito", id: insertId });
    });
};
