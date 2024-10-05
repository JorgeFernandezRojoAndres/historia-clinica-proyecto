const express = require('express');
const router = express.Router();
const citasController = require('../app/controllers/citasController'); 

// Ruta para listar todas las citas
router.get('/', citasController.listAll);

// Ruta para mostrar el formulario de crear una nueva cita
router.get('/new', citasController.showNewForm);

// Ruta para crear una nueva cita
router.post('/', citasController.create);

// Ruta para mostrar el formulario de editar una cita
router.get('/edit/:id', citasController.showEditForm);

// Ruta para actualizar una cita
router.post('/update/:id', citasController.update);

// Ruta para eliminar una cita
router.get('/delete/:id', citasController.delete);

module.exports = router;
