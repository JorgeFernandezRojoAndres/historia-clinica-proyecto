const express = require('express');
const router = express.Router();
const citasController = require('../app/controllers/citasController');
const { isAuthenticated, isSecretaria, isPacienteOrSecretaria } = require('../middleware/roleMiddleware');

// Listar todas las citas
router.get('/', isAuthenticated, citasController.listAll);

// Mostrar el formulario para crear una nueva cita
router.get('/new', isAuthenticated, isPacienteOrSecretaria, citasController.showNewForm);

// Crear una nueva cita
router.post('/new', isAuthenticated, isPacienteOrSecretaria, citasController.createCita);

// Mostrar el formulario para editar una cita
router.get('/edit/:id', isAuthenticated, citasController.showEditForm);

// Actualizar una cita
router.post('/update/:id', isAuthenticated, citasController.update);

// Eliminar una cita
router.get('/delete/:id', isAuthenticated, citasController.delete);

// Ruta para filtrar citas por estado (solo para secretaria)
router.get('/filter', isAuthenticated, isSecretaria, citasController.filterByState);
// Eliminar un turno completado
router.get('/delete-completed/:id', isAuthenticated, isPacienteOrSecretaria, citasController.deleteCompleted);

// Eliminar una cita normal
router.get('/delete/:id', isAuthenticated, isPacienteOrSecretaria, citasController.delete);
// Ruta para contar citas en proceso
router.get('/count-en-proceso', isAuthenticated, isSecretaria, citasController.countEnProceso);
// Ruta para el autocompletado de pacientes en el formulario de creación de citas
router.get('/buscar-paciente', isAuthenticated, isPacienteOrSecretaria, citasController.autocompletePacientesParaCita);

module.exports = router;
