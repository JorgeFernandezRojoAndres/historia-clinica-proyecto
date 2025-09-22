const express = require('express');
const router = express.Router();
const { isAuthenticated, isSecretaria } = require('../middleware/roleMiddleware');

// Importamos los controladores necesarios
const pacientesController = require('../app/controllers/pacientesController');
const medicosController = require('../app/controllers/medicosController');
const citasController = require('../app/controllers/citasController');

// Middleware global para verificar autenticación y rol de secretaria
router.use(isAuthenticated, isSecretaria);

// **Rutas de gestión de pacientes**
router.get('/pacientes', pacientesController.listAll);
router.get('/pacientes/new', pacientesController.showRegisterForm);
router.post('/pacientes', pacientesController.create);
router.get('/pacientes/:id/edit', pacientesController.showEditForm);
router.post('/pacientes/:id', pacientesController.update);
router.delete('/pacientes/:id/delete', pacientesController.delete);
router.get('/pacientes/search', pacientesController.search);

// **Rutas de médicos**
router.get('/ver-medicos', medicosController.listAllReadOnly);

// **Dashboard de la secretaria**
router.get('/dashboard', (req, res) => {
    res.render('escritorioSecretaria', { user: req.session.user });
});

// **Rutas de gestión de citas**
router.get('/citas', citasController.filterByState);
router.get('/citas/new', citasController.showNewForm);
router.post('/citas', citasController.createCita);
router.get('/citas/:id/edit', citasController.showEditForm);
router.post('/citas/:id', citasController.update);
router.delete('/citas/:id/delete', citasController.delete);
router.post('/citas/confirmar-pendientes', citasController.confirmarPendientes);

module.exports = router;
