const express = require('express');
const router = express.Router();
const pacientesController = require('../app/controllers/pacientesController');
const authMiddleware = require('../middleware/roleMiddleware');

// Ruta para que el paciente vea su propio perfil
router.get('/mi-perfil', authMiddleware.isAuthenticated, authMiddleware.isPaciente, pacientesController.showProfile);

// Redirigir a los pacientes que acceden a /pacientes a su perfil
router.get('/', authMiddleware.isAuthenticated, authMiddleware.isPaciente, (req, res) => {
    res.redirect('/paciente/mi-perfil');
    console.log("🚀 ~ router.get ~ perfil:", mi-perfil)
});
    
    

// Ruta para mostrar el formulario de editar un paciente (acceso solo para el paciente)
router.get('/edit/:id', authMiddleware.isAuthenticated, authMiddleware.isPaciente, pacientesController.showEditForm);

// Ruta para actualizar un paciente
router.post('/update/:id', authMiddleware.isAuthenticated, authMiddleware.isPaciente, pacientesController.update);

// **Nueva Ruta para Buscar Pacientes**
router.get('/search', authMiddleware.isAuthenticated, authMiddleware.isSecretaria, (req, res) => {
    const query = req.query.query; // Obtener la query desde los parámetros de la URL
    console.log('Buscando pacientes con query:', query);

    pacientesController.search(query, (error, results) => {
        if (error) {
            console.error('Error al buscar pacientes:', error);
            return res.status(500).send('Error al buscar pacientes');
        }
        res.json(results); // Devolver los resultados como JSON
    });
});

// Eliminamos las rutas que solo deberían ser accesibles por secretarias
// Si en el futuro necesitas esas rutas, puedes crear un archivo diferente o agregar un middleware para esas funciones específicas.

module.exports = router;
