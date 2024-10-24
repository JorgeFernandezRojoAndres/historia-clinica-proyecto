const express = require('express');
const router = express.Router();
const { getEspecialidades } = require('../app/controllers/especialidadesController');

// Definir la ruta para obtener todas las especialidades
router.get('/', getEspecialidades);

module.exports = router; // Asegúrate de exportar el enrutador
