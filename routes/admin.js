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

router.get('/formulario-asignar-clinica', isAuthenticated, isAdmin, (req, res) => {
    res.render('formularioAsignarClinica');
});

// Ruta para manejar los horarios libres de los médicos
router.get('/manejar-horarios-libres', isAuthenticated, isAdmin, (req, res) => {
    res.redirect('/admin/dashboard');
});
//ruta para renderizar y asignar las clinicas
router.get('/formulario-asignar-clinica', isAuthenticated, isAdmin, adminController.mostrarFormularioAsignarClinica);

module.exports = router;
