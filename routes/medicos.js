const db = require('../config/database');
const express = require('express');
const router = express.Router();
const medicosController = require('../app/controllers/medicosController');
const authMiddleware = require('../middleware/roleMiddleware');
const citasController = require('../app/controllers/citasController');



// Ruta para ver la "Agenda del Día"
router.get('/:id/agenda-dia', authMiddleware.isAuthenticated, (req, res) => {
    medicosController.verAgendaDelDia(req, res);
});

// Ruta para "Filtrar Turnos por Fecha"
router.get('/:id/filtrar-turnos', authMiddleware.isAuthenticated, (req, res) => {
    medicosController.filtrarTurnosPorFecha(req, res);
});





// Modifica la ruta para incluir las citas
router.get('/perfil', authMiddleware.isAuthenticated, authMiddleware.isDoctor, (req, res) => {
    const user = req.session.user;

    if (user.password_change_required) {
        return res.render('CDC', { user });
    } else {
        const sql = `
            SELECT citas.idCita, pacientes.nombre AS nombrePaciente, citas.fechaHora, citas.motivoConsulta
            FROM citas
            JOIN pacientes ON citas.idPaciente = pacientes.idPaciente
            WHERE citas.idMedico = ? AND DATE(citas.fechaHora) = CURDATE()
        `;

        db.query(sql, [user.id], (error, results) => {
            if (error) {
                console.error('Error al obtener las citas:', error);
                return res.status(500).send('Error al cargar el escritorio del médico');
            }

            res.render('escritorioMedico', {
                user: user,
                citas: results
            });
        });
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


// Ruta para iniciar la consulta
router.post('/iniciar/:idCita', citasController.iniciarConsulta);
router.get('/iniciar-consulta/:idCita', citasController.cargarConsulta);
module.exports = router;
