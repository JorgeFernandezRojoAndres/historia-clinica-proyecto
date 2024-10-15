const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/roleMiddleware');

// Importamos los controladores necesarios
const pacientesController = require('../app/controllers/pacientesController');
const medicosController = require('../app/controllers/medicosController');

// Middleware para verificar autenticación y rol de secretaria
router.use(authMiddleware.isAuthenticated, authMiddleware.isSecretaria);

// Rutas de gestión de pacientes
router.get('/pacientes', pacientesController.listAll);
router.get('/pacientes/new', pacientesController.showNewForm);
router.post('/pacientes', pacientesController.create);
router.get('/pacientes/:id/edit', pacientesController.showEditForm);
router.post('/pacientes/:id', pacientesController.update);
router.delete('/pacientes/:id/delete', pacientesController.delete);


// Dashboard de la secretaria
router.get('/dashboard', (req, res) => {
    res.render('escritorioSecretaria', { user: req.session.user });
});

// **Rutas para gestionar pacientes**
router.get('/pacientes', (req, res) => {
    console.log('Accediendo a /secretaria/pacientes con usuario:', req.session.user);
    pacientesController.listAll(req, res);
});

router.get('/pacientes/search', (req, res) => {
    console.log('Query recibida:', req.query);
    pacientesController.search(req, res);
});

// Rutas de gestión de médicos
router.get('/medicos', medicosController.listAll);

router.get('/medicos/new', medicosController.showNewForm);
router.post('/medicos', medicosController.create);
router.get('/medicos/:id/edit', medicosController.showEditForm);
router.post('/:id', medicosController.update);


router.delete('/medicos/:id/delete', medicosController.delete);




// **Rutas para gestionar citas**
const citasController = require('../app/controllers/citasController');

router.get('/citas', citasController.listAll);
router.get('/citas/new', citasController.showNewForm);
router.post('/citas', citasController.create);
router.get('/citas/:id/edit', citasController.showEditForm);
router.post('/citas/:id', citasController.update);
router.delete('/citas/:id/delete', citasController.delete);

module.exports = router;
