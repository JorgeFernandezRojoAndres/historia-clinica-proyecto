const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/roleMiddleware');

// Importamos los controladores necesarios
const pacientesController = require('../app/controllers/pacientesController');
const medicosController = require('../app/controllers/medicosController');
const citasController = require('../app/controllers/citasController');

// Middleware para verificar autenticación y rol de secretaria
router.use(authMiddleware.isAuthenticated, authMiddleware.isSecretaria);

// **Rutas de gestión de pacientes** ✅ secretaria puede ver, crear, editar y eliminar
router.get('/pacientes', pacientesController.listAll);
router.get('/pacientes/new', pacientesController.showRegisterForm); // Corregido a showRegisterForm
router.post('/pacientes', pacientesController.create);
router.get('/pacientes/:id/edit', pacientesController.showEditForm);
router.post('/pacientes/:id', pacientesController.update);
router.delete('/pacientes/:id/delete', pacientesController.delete);

// Ruta de búsqueda de pacientes
router.get('/pacientes/search', (req, res) => {
    console.log('Query recibida:', req.query);
    pacientesController.search(req, res);
});

// **Rutas de gestión de médicos** 🔒 secretaria solo lectura
// 👉 cambiamos a un método exclusivo para secretaria (sin editar/eliminar)
router.get('/ver-medicos', medicosController.listAllReadOnly);

// ❌ Se quitan rutas de creación/edición/eliminación de médicos para secretarias
// router.get('/medicos/new', medicosController.showNewForm);
// router.post('/medicos', medicosController.create);
// router.get('/medicos/:id/edit', medicosController.showEditForm);
// router.post('/medicos/:id', medicosController.update);
// router.delete('/medicos/:id/delete', medicosController.delete);

// Dashboard de la secretaria
router.get('/dashboard', (req, res) => {
    res.render('escritorioSecretaria', { user: req.session.user });
});

// **Rutas para gestionar citas** ✅ secretaria puede ver, crear, editar y eliminar
router.get('/citas', citasController.listAll);
router.get('/citas/new', citasController.showNewForm);
router.post('/citas', citasController.createCita);
router.get('/citas/:id/edit', citasController.showEditForm);
router.post('/citas/:id', citasController.update);
router.delete('/citas/:id/delete', citasController.delete);

module.exports = router;
