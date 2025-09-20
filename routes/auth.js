const express = require('express');
const router = express.Router();
const authController = require('../app/controllers/authController');
const pacientesController = require('../app/controllers/pacientesController');


// console.log  para verificar las importaciones
console.log('authController:', authController);
console.log('pacientesController:', pacientesController);
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
// Ruta para el formulario de inicio de sesión de administrador
router.get('/login/administrador', (req, res) => {
  res.render('loginadministrador');  // Asegúrate de tener esta vista `loginadministrador.pug`
});

// Ruta para procesar el inicio de sesión de administrador
router.post('/login/administrador', authController.loginAdministrador);
  // Ruta para el dashboard de la secretaria
router.get('/secretaria/dashboard', (req, res) => {
  if (!req.session.user || req.session.user.role !== 'secretaria') {
    // Redirigir al login si no está autenticada o no es secretaria
    return res.redirect('/login/secretaria');
}

// Renderiza la vista con los datos del usuario
res.render('escritorioSecretaria', { user: req.session.user });
});
  
// Rutas para registro de pacientes
router.get('/register/paciente', (req, res) => {
  res.render('new_pacientes');  // Asegúrate de tener la vista `new_pacientes.pug`
});
router.post('/register/paciente', pacientesController.create);
// Ruta para mostrar mensaje de registro pendiente
router.get('/registro-pendiente', (req, res) => {
  console.log('Accediendo a la ruta /registro-pendiente');
  res.render('registroPendiente'); // Asegúrate de que esta vista existe
});


// Ruta para logout
router.get('/logout', authController.logout);



module.exports = router;
