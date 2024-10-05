const express = require('express');
const router = express.Router();
const medicosController = require('../app/controllers/medicosController');

// Ruta para listar todos los médicos
router.get('/', medicosController.listAll);

// Ruta para mostrar el formulario de crear un nuevo médico
router.get('/new', medicosController.showNewForm);

// Ruta para crear un nuevo médico
router.post('/', medicosController.create);

// Ruta para mostrar el formulario de editar un médico
router.get('/edit/:id', medicosController.showEditForm);

// Ruta para actualizar un médico
router.post('/update/:id', medicosController.update);

// Ruta para eliminar un médico
router.get('/delete/:id', medicosController.delete);

module.exports = router;
