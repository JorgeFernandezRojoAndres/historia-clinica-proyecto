const db = require('../config/database');
const express = require('express');
const router = express.Router();
const medicosController = require('../app/controllers/medicosController');
const authMiddleware = require('../middleware/roleMiddleware');
const citasController = require('../app/controllers/citasController');

// Definir la ruta para obtener las citas en formato JSON para FullCalendar
router.get('/agenda', citasController.obtenerCitasJSON);
// Ver la agenda del médico (para secretarias y médicos)
router.get(
    '/:id/agenda',
    authMiddleware.isAuthenticated,
    (req, res, next) => {
      const userRole = req.session.user?.role;
      if (userRole === 'doctor' || userRole === 'secretaria') {
        next(); // Permitir acceso
      } else {
        return res.status(403).send('No tienes permiso para acceder a esta página.');
      }
    },
    async (req, res) => {
      const medicoId = req.params.id;
      try {
        const [citas] = await db.promise().query(`
          SELECT fechaHora AS start, motivoConsulta AS title 
          FROM citas 
          WHERE idMedico = ?
        `, [medicoId]);
        res.render('agenda_medico', { citas }); // Renderiza la vista Pug con las citas
      } catch (error) {
        console.error('Error al obtener la agenda del médico:', error);
        res.status(500).send('Error al obtener la agenda');
      }
    }
  );
  

// Ruta para actualizar un médico por su ID
router.post('/:id', medicosController.update);
// Listar todos los médicos
router.get('/', medicosController.listAll);
// Ruta del escritorio del médico (solo accesible por médicos autenticados)
router.get(
    '/escritorio',
    authMiddleware.isAuthenticated,
    authMiddleware.isDoctor,
    (req, res) => {
        res.render('escritorioMedicos', { user: req.session.user });
    }
);
// Ver la agenda del médico con sus citas del día (accesible solo para médicos)
router.get(
    '/:id/agenda',
    authMiddleware.isAuthenticated,
    (req, res, next) => {
        const userRole = req.session.user?.role;
        if (userRole === 'doctor' || userRole === 'secretaria') {
            next(); // Permitir acceso si es médico o secretaria
        } else {
            return res.status(403).send('No tienes permiso para acceder a esta página.');
        }
    },
    medicosController.verAgenda
);
// Ruta para cambiar la contraseña del médico
router.post(
    '/change-password',
    authMiddleware.isAuthenticated,
    medicosController.changePassword
);
// Ruta para buscar médicos (accesible para secretarias)
router.get(
    '/search',
    authMiddleware.isAuthenticated,
    authMiddleware.isSecretaria,
    medicosController.search
);
module.exports = router;