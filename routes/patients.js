const express = require('express');
const router = express.Router();
const patientsController = require('../app/controllers/patientsController');

// Ruta para listar todos los pacientes
router.get('/', patientsController.listAll);

// Ruta para mostrar el formulario de crear un nuevo paciente
router.get('/new', patientsController.showNewForm); 

// Ruta para crear un nuevo paciente
router.post('/', patientsController.create);

// Ruta para mostrar el formulario de editar un paciente
router.get('/edit/:id', patientsController.showEditForm);

// Ruta para actualizar un paciente
router.post('/update/:id', patientsController.update);

// Ruta para eliminar un paciente
router.get('/delete/:id', patientsController.delete);



module.exports = router;
