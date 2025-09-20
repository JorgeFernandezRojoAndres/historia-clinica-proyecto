const express = require('express');
const router = express.Router();
const pacientesController = require('../app/controllers/pacientesController');
const authMiddleware = require('../middleware/roleMiddleware');

// Verificar si los middlewares están definidos
console.log('authMiddleware.isAuthenticated:', authMiddleware.isAuthenticated);
console.log('authMiddleware.isAdmin:', authMiddleware.isAdmin);

// Ruta para que el paciente vea su propio perfil
router.get('/mi-perfil', authMiddleware.isAuthenticated, authMiddleware.isPaciente, (req, res) => {
    console.log('Accediendo a la ruta /mi-perfil'); // Log para acceder a mi-perfil
    pacientesController.showProfile(req, res);
});

// Redirigir a los pacientes que acceden a /pacientes a su perfil
router.get('/', authMiddleware.isAuthenticated, authMiddleware.isPaciente, (req, res) => {
    console.log('Redirigiendo a /mi-perfil'); // Log para redirección
    res.redirect('/paciente/mi-perfil');
});

// Ruta para mostrar el formulario de editar un paciente (acceso solo para el paciente)
router.get('/edit/:id', authMiddleware.isAuthenticated, authMiddleware.isPaciente, (req, res) => {
    console.log(`Accediendo a la ruta /edit/${req.params.id}`); // Log para ver la edición
    pacientesController.showEditForm(req, res);
});

// Ruta para actualizar un paciente
router.post('/update/:id', authMiddleware.isAuthenticated, authMiddleware.isPaciente, (req, res) => {
    console.log(`Actualizando paciente con ID: ${req.params.id}`); // Log para actualización
    pacientesController.update(req, res);
});

// Ruta para mostrar el formulario de registro de un nuevo paciente
router.get('/register', (req, res) => {
    console.log('Accediendo a la ruta /register'); // Log para acceso a registro
    pacientesController.showRegisterForm(req, res);
});

// Ruta para crear un nuevo paciente
router.post('/', (req, res) => {
    console.log('Creando nuevo paciente:', req.body); // Log para mostrar los datos del nuevo paciente
    pacientesController.create(req, res);
});

// Ruta para mostrar pacientes pendientes de confirmación
router.get('/admin/pacientes-pendientes', authMiddleware.isAuthenticated, authMiddleware.isAdministrador, (req, res) => {
    console.log('Accediendo a la ruta /admin/pacientes-pendientes'); // Log para acceso a pacientes pendientes
    pacientesController.showPendingPatients(req, res);
});

// Ruta para mostrar mensaje de registro pendiente
router.get('/registro-pendiente', (req, res) => {
    console.log('Accediendo a la ruta /registro-pendiente'); // Log para acceso a registro pendiente
    res.render('registro-pendiente'); // Asegúrate de tener la vista `registroPendiente.pug`
});

// Ruta para confirmar un paciente
router.post('/admin/confirmar-paciente/:id', authMiddleware.isAuthenticated, authMiddleware.isAdministrador, (req, res) => {
    console.log(`Confirmando paciente con ID: ${req.params.id}`); // Log para confirmar paciente
    pacientesController.confirmPatient(req, res);
});

// Ruta para rechazar un paciente
router.post('/admin/rechazar-paciente/:id', authMiddleware.isAuthenticated, authMiddleware.isAdministrador, (req, res) => {
    console.log(`Rechazando paciente con ID: ${req.params.id}`); // Log para rechazar paciente
    pacientesController.rejectPatient(req, res);
});

// **Nueva Ruta para Buscar Pacientes**
router.get('/search', authMiddleware.isAuthenticated, authMiddleware.isSecretaria, (req, res) => {
    const query = req.query.query; // Obtener la query desde los parámetros de la URL
    console.log('Buscando pacientes con query:', query); // Log para buscar pacientes

    pacientesController.search(query, (error, results) => {
        if (error) {
            console.error('Error al buscar pacientes:', error);
            return res.status(500).send('Error al buscar pacientes');
        }
        console.log('Resultados de la búsqueda:', results); // Log para ver los resultados de búsqueda
        res.json(results); // Devolver los resultados como JSON
    });
});

module.exports = router;
