const express = require('express');
const router = express.Router();
const citasController = require('../app/controllers/citasController');
const authMiddleware = require('../middleware/roleMiddleware'); 



// Listar todas las citas
router.get('/', citasController.listAll);

// Mostrar el formulario para crear una nueva cita
router.get('/new', citasController.showNewForm);

// Crear una nueva cita
router.post('/new', citasController.create);

// Mostrar el formulario para editar una cita
router.get('/edit/:id', citasController.showEditForm);

// Actualizar una cita
router.post('/update/:id', citasController.update);

// Eliminar una cita
router.get('/delete/:id', citasController.delete);

// Definir la ruta para obtener las citas en formato JSON para FullCalendar
router.get('/api/medicos/:id/agenda', citasController.obtenerCitasJSON);

module.exports = router;