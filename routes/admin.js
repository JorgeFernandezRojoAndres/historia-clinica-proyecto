const express = require('express');
const router = express.Router();
const adminController = require('../app/controllers/adminController');
const pacientesController = require('../app/controllers/pacientesController');
const diasController = require('../app/controllers/diasNoLaborablesController'); // 👈 nuevo
const { isAuthenticated, isAdmin } = require('../middleware/roleMiddleware');
const medicosController = require('../app/controllers/medicosController');
const vacacionesController = require('../app/controllers/vacacionesController');
// Ruta para el dashboard del administrador
router.get('/dashboard', isAuthenticated, isAdmin, adminController.renderAdminDashboard);

// Rutas de administración
router.post('/registrar-usuario', isAuthenticated, isAdmin, adminController.registrarUsuario);
router.post('/asignar-clinica', isAuthenticated, isAdmin, adminController.asignarClinica);

// Ruta para obtener médicos según la clínica y especialidad seleccionada
router.get('/get-doctors', isAuthenticated, isAdmin, adminController.getDoctors);

// 🚑 Rutas de pacientes
router.get('/pacientes-pendientes', isAuthenticated, isAdmin, pacientesController.showPendingPatients);
router.post('/confirmar-paciente/:idPaciente', isAuthenticated, isAdmin, pacientesController.confirmPatient);
router.post('/rechazar-paciente/:idPaciente', isAuthenticated, isAdmin, pacientesController.rejectPatient);

// Ruta para ver todos los médicos
router.get('/ver-medicos', isAuthenticated, isAdmin, adminController.verMedicos);
// ✏️ CRUD de médicos (solo admin)
router.get('/medicos/:id/edit', isAuthenticated, isAdmin, medicosController.showEditForm); // Formulario edición
router.post('/medicos/:id', isAuthenticated, isAdmin, medicosController.update);          // Guardar cambios
router.post('/medicos/:id/delete', isAuthenticated, isAdmin, medicosController.delete); 
// Ruta para mostrar el formulario de asignación de clínicas
router.get('/formulario-asignar-clinica', isAuthenticated, isAdmin, adminController.formularioAsignarClinica);

// 📅 Rutas para días no laborables
router.get('/dias-no-laborables', isAuthenticated, isAdmin, diasController.renderList);
router.get('/formulario-registrar-usuario', adminController.formularioRegistrarUsuario);
router.post('/especialidades', adminController.agregarEspecialidad);

router.post('/dias-no-laborables', isAuthenticated, isAdmin, diasController.create);
router.delete('/dias-no-laborables/:id', isAuthenticated, isAdmin, diasController.remove);
router.get('/vacaciones', isAuthenticated, isAdmin, vacacionesController.renderList);
router.post('/vacaciones', isAuthenticated, isAdmin, vacacionesController.create);
router.delete('/vacaciones/:id', isAuthenticated, isAdmin, vacacionesController.remove);
module.exports = router;
