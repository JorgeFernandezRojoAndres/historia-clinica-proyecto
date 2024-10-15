const express = require('express');
const router = express.Router();
const authController = require('../app/controllers/authController');


// Rutas para mostrar los formularios de login según el rol

// Ruta para login de pacientes
router.post('/login/paciente', authController.loginPaciente);

router.get('/login/paciente', (req, res) => {
    res.render('loginpacientes');
  });
//Rutas para login de medico
router.post('/login/medico', authController.loginMedico);

  router.get('/login/medico', (req, res) => {
    res.render('loginmedicos');
  });
  //Rutas para login de Secretaria
  router.post('/login/secretaria', authController.loginSecretaria);
  router.get('/login/secretaria', (req, res) => {
    res.render('loginsecretarias');
  });
  // Ruta para el dashboard de la secretaria
router.get('/secretaria/dashboard', (req, res) => {
  if (!req.session.user || req.session.user.role !== 'secretaria') {
    // Redirigir al login si no está autenticada o no es secretaria
    return res.redirect('/login/secretaria');
}

// Renderiza la vista con los datos del usuario
res.render('escritorioSecretaria', { user: req.session.user });
});
  



// Ruta para logout
router.get('/logout', authController.logout);

module.exports = router;
