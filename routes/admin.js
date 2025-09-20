const express = require('express');
const router = express.Router();
const adminController = require('../app/controllers/adminController');
const pacientesController = require('../app/controllers/pacientesController');
const diasController = require('../app/controllers/diasNoLaborablesController'); // 👈 nuevo
const { isAuthenticated, isAdmin } = require('../middleware/roleMiddleware');

// Ruta para el dashboard del administrador
router.get('/dashboard', isAuthenticated, isAdmin, adminController.renderAdminDashboard);

// Rutas de administración
router.post('/registrar-usuario', isAuthenticated, isAdmin, adminController.registrarUsuario);
router.post('/asignar-clinica', isAuthenticated, isAdmin, adminController.asignarClinica);

// Rutas para mostrar formularios específicos
router.get('/formulario-registrar-usuario', isAuthenticated, isAdmin, (req, res) => {
    res.render('formularioRegistrarUsuario');
});

// Ruta para obtener médicos según la clínica y especialidad seleccionada
router.get('/get-doctors', isAuthenticated, isAdmin, adminController.getDoctors);

// 🚑 Rutas de pacientes
router.get('/pacientes-pendientes', isAuthenticated, isAdmin, pacientesController.showPendingPatients);
router.post('/confirmar-paciente/:idPaciente', isAuthenticated, isAdmin, pacientesController.confirmPatient);
router.post('/rechazar-paciente/:idPaciente', isAuthenticated, isAdmin, pacientesController.rejectPatient);

// Ruta para ver todos los médicos
router.get('/ver-medicos', isAuthenticated, isAdmin, adminController.verMedicos);

// Ruta para mostrar el formulario de asignación de clínicas
router.get('/formulario-asignar-clinica', isAuthenticated, isAdmin, adminController.formularioAsignarClinica);

// 📅 Rutas para días no laborables
router.get('/dias-no-laborables', isAuthenticated, isAdmin, diasController.renderList);

router.post('/dias-no-laborables', isAuthenticated, isAdmin, diasController.create);
router.delete('/dias-no-laborables/:id', isAuthenticated, isAdmin, diasController.remove);

module.exports = router;
