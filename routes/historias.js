const express = require('express');
const router = express.Router();
const historiasController = require('../app/controllers/historiasController');
const pacientesController = require('../app/controllers/pacientesController');
const authMiddleware = require('../middleware/roleMiddleware');


// Rutas protegidas para doctores
router.get('/', authMiddleware.isAuthenticated, authMiddleware.isDoctor, historiasController.listAll);
router.get('/edit/:id', authMiddleware.isAuthenticated, authMiddleware.isDoctor, historiasController.showEditForm);
router.post('/update/:id', authMiddleware.isAuthenticated, authMiddleware.isDoctor, historiasController.update);
// Ruta para listar todas las historias clínicas
router.get('/', historiasController.listAll);

// Ruta para mostrar el formulario de crear una nueva historia
router.get('/new', historiasController.showNewForm);

// Ruta para crear una nueva historia
router.post('/new', historiasController.create);

// Ruta para editar una historia 
router.get('/edit/:id', historiasController.showEditForm);


// Ruta para actualizar una historia 
router.post('/update/:id', historiasController.update);

// Ruta para eliminar una historia 
router.get('/delete/:id', historiasController.delete);
// Ruta para buscar un paciente por DNI
router.get('/buscarPaciente/:dni', pacientesController.buscarPaciente);


module.exports = router;
