// routes/medicalRecordsRoutes.js

const express = require('express');
const router = express.Router();
const medicalRecordController = require('../controllers/medicalRecordController');

// Ruta para crear un nuevo registro médico
router.post('/medical-records', medicalRecordController.addMedicalRecord);

module.exports = router;
