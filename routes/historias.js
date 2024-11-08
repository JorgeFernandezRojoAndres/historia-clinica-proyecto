const express = require('express');
const router = express.Router();
const historiasController = require('../app/controllers/historiasController');
const pacientesController = require('../app/controllers/pacientesController');
const authMiddleware = require('../middleware/roleMiddleware');

// Rutas protegidas para pacientes y médicos
router.get('/', authMiddleware.isAuthenticated, authMiddleware.isPacienteOrMedico, historiasController.listAll);
router.get('/edit/:id', authMiddleware.isAuthenticated, authMiddleware.isPacienteOrMedico, historiasController.showEditForm);
router.post('/update/:id', authMiddleware.isAuthenticated, authMiddleware.isPacienteOrMedico, historiasController.update);

// Ruta para mostrar el formulario de crear una nueva historia (si solo médicos deben acceder, aplica `isMedico`)
router.get('/new', authMiddleware.isAuthenticated, authMiddleware.isMedico, historiasController.showNewForm);

// Ruta para crear una nueva historia (solo médicos si aplica `isMedico`)
router.post('/new', authMiddleware.isAuthenticated, authMiddleware.isMedico, historiasController.create);

// Ruta para eliminar una historia (aplicar `isMedico` si solo médicos pueden eliminar)
router.get('/delete/:id', authMiddleware.isAuthenticated, authMiddleware.isMedico, historiasController.delete);

// Ruta para buscar un paciente por DNI (si aplica a todos, puedes dejar sin restricciones adicionales)
router.get('/buscarPaciente/:dni', pacientesController.buscarPaciente);
// Ruta para descargar el PDF de una historia clínica (solo para pacientes autenticados)
router.get('/download/:id', authMiddleware.isAuthenticated, authMiddleware.isPaciente, historiasController.downloadPDF);

module.exports = router;
