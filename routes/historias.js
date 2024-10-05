const express = require('express');
const router = express.Router();
const historiasController = require('../app/controllers/historiasController');
const patientsController = require('../app/controllers/patientsController');


// Ruta para listar todas las historias clínicas
router.get('/', historiasController.listAll);

// Ruta para mostrar el formulario de crear una nueva historia
router.get('/new', historiasController.showNewForm);

// Ruta para crear una nueva historia
router.post('/new', historiasController.create);

// Ruta para editar una historia (si la tienes)
router.get('/edit/:id', historiasController.showEditForm);

// Ruta para actualizar una historia (si la tienes)
router.post('/update/:id', historiasController.update);

// Ruta para eliminar una historia (si la tienes)
router.get('/delete/:id', historiasController.delete);
// Ruta para buscar un paciente por DNI
router.get('/buscarPaciente/:dni', patientsController.buscarPaciente);


module.exports = router;
