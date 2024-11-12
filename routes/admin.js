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

// Ruta para el dashboard del administrador utilizando el controlador para cargar especialidades y médicos
router.get('/dashboard', isAuthenticated, isAdmin, adminController.renderAdminDashboard);

// Ruta para ver los horarios libres de un médico específico en una nueva ventana
router.get('/medico/:idMedico/horarios-libres', isAuthenticated, isAdmin, adminController.verHorariosLibres);

// Rutas de administración
router.post('/agregar-horario-libre', isAuthenticated, isAdmin, adminController.agregarHorarioLibre);
router.post('/registrar-usuario', isAuthenticated, isAdmin, adminController.registrarUsuario);
router.post('/asignar-clinica', isAuthenticated, isAdmin, adminController.asignarClinica);

// Rutas para mostrar formularios específicos
router.get('/formulario-registrar-usuario', isAuthenticated, isAdmin, (req, res) => {
    res.render('formularioRegistrarUsuario');
});

// Ruta para manejar los horarios libres de los médicos
router.get('/manejar-horarios-libres', isAuthenticated, isAdmin, (req, res) => {
    res.redirect('/admin/dashboard');
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

// Ruta para agregar un nuevo horario libre
router.post('/agregar-horario-libre', isAuthenticated, isAdmin, adminController.agregarHorarioLibre);

// Ruta para eliminar un horario libre existente
router.post('/eliminar-horario-libre', isAuthenticated, isAdmin, adminController.eliminarHorarioLibre);

// Ruta para ver los horarios de un médico
router.get('/ver-horarios-medico', isAuthenticated, isAdmin, adminController.verHorariosMedico);

module.exports = router;
