const express = require('express');
const router = express.Router();
const adminController = require('../app/controllers/adminController');
const { isAuthenticated } = require('../middleware/roleMiddleware'); // Middleware de autenticación

// Middleware para verificar si el usuario es administrador
const isAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'administrador') {
        return next();
    }
    return res.status(403).send('Acceso no autorizado');
};

// Ruta para el dashboard del administrador
router.get('/dashboard', isAuthenticated, isAdmin, adminController.renderAdminDashboard);

// Rutas de administración
router.post('/registrar-usuario', isAuthenticated, isAdmin, adminController.registrarUsuario);
router.post('/asignar-clinica', isAuthenticated, isAdmin, adminController.asignarClinica);

// Rutas para mostrar formularios específicos
router.get('/formulario-registrar-usuario', isAuthenticated, isAdmin, (req, res) => {
    res.render('formularioRegistrarUsuario');
});

// Ruta para obtener médicos según la clínica y especialidad seleccionada (para carga dinámica)
router.get('/get-doctors', isAuthenticated, isAdmin, adminController.getDoctors);

// Ruta para ver los pacientes pendientes de confirmación
router.get('/pacientes-pendientes', isAuthenticated, isAdmin, adminController.verPacientesPendientes);

// Ruta para confirmar paciente
router.post('/confirmar-paciente/:idPaciente', isAuthenticated, isAdmin, adminController.confirmarPaciente);

// Ruta para rechazar paciente
router.post('/rechazar-paciente/:idPaciente', isAuthenticated, isAdmin, adminController.rechazarPaciente);

// Ruta para ver todos los médicos
router.get('/ver-medicos', isAuthenticated, isAdmin, adminController.verMedicos);
// Ruta para mostrar el formulario de asignación de clínicas
router.get('/formulario-asignar-clinica', isAuthenticated, isAdmin, adminController.formularioAsignarClinica);

module.exports = router;
