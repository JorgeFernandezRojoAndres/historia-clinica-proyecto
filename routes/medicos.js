const db = require('../config/database');
const express = require('express');
const router = express.Router();
const medicosController = require('../app/controllers/medicosController');
const authMiddleware = require('../middleware/roleMiddleware');
const citasController = require('../app/controllers/citasController');

// Ruta para obtener citas en formato JSON
router.get('/api/medicos/:id/agenda', (req, res, next) => {
    console.log('Accediendo a la ruta: /api/medicos/:id/agenda');
    console.log('ID del médico:', req.params.id); // Verifica el ID del médico
    citasController.obtenerCitasJSON(req, res);
});

// **Ver la agenda del médico (accesible para secretarias y médicos)** 
router.get(
    '/:id/agenda',
    authMiddleware.isAuthenticated,
    (req, res, next) => {
        const userRole = req.session.user?.role;
        console.log('Acceso a la agenda del médico, rol del usuario:', userRole); // Verifica el rol
        if (userRole === 'doctor' || userRole === 'secretaria') {
            next(); // Permitir acceso si es doctor o secretaria
        } else {
            return res.status(403).send('No tienes permiso para acceder a esta página.');
        }
    },
    medicosController.verAgenda
);

// **Ruta para ver el perfil del médico**
router.get('/perfil', authMiddleware.isAuthenticated, authMiddleware.isDoctor, (req, res) => {
    const user = req.session.user;

    if (user.password_change_required) {
        console.log("Redirigiendo al cambio de contraseña");
        return res.render('CDC', { user }); // Redirige al cambio de contraseña si es necesario
    } else {
        console.log("Redirigiendo al perfil del médico");
        return res.render('escritorioMedico', { user }); // Redirige al escritorio del médico
    }
});

// **Ruta para actualizar un médico por su ID**
router.post('/:id', medicosController.update);

// **Listar todos los médicos**
router.get('/', medicosController.listAll);

// **Escritorio del médico (solo accesible para médicos autenticados)**
router.get(
    '/escritorio',
    authMiddleware.isAuthenticated,
    authMiddleware.isDoctor,
    (req, res) => {
        res.render('escritorioMedicos', { user: req.session.user });
    }
);

// **Ruta para cambiar la contraseña del médico**
router.post('/cambiar-contrasena', authMiddleware.isAuthenticated, medicosController.changePassword);

// **Ruta GET para renderizar el formulario de cambio de contraseña**
router.get('/cambiar-contrasena', authMiddleware.isAuthenticated, (req, res) => {
    console.log("Renderizando vista de cambio de contraseña");
    res.render('CDC'); // Renderiza la vista de cambio de contraseña
});

// **Ruta para buscar médicos (accesible para secretarias)**
router.get(
    '/search',
    authMiddleware.isAuthenticated,
    authMiddleware.isSecretaria,
    medicosController.search
);

module.exports = router;
