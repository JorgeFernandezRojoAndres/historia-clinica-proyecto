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

// ✅ Agenda del médico logueado (usa el ID de la sesión)
router.get('/agenda', authMiddleware.isAuthenticated, authMiddleware.isMedico, (req, res) => {
    const medicoId = req.session.user?.id;
    if (!medicoId) {
        return res.status(400).send("No se pudo identificar al médico en la sesión.");
    }
    medicosController.verAgenda(req, res, medicoId);
});

// ✅ Agenda de un médico específico (para secretaria/admin/paciente)
router.get('/:id/agenda', authMiddleware.isAuthenticated, (req, res) => {
    const medicoId = req.params.id;
    medicosController.verAgenda(req, res, medicoId);
});


// Modificar la ruta para incluir las citas y la lista de pacientes
router.get('/perfil', authMiddleware.isAuthenticated, authMiddleware.isMedico, (req, res) => {
    const user = req.session.user;

    if (user.password_change_required) {
        return res.render('CDC', { user });
    } else {
        // Consulta para obtener las citas del médico para la fecha actual
        const sqlCitas = `
            SELECT citas.idCita, pacientes.nombre AS nombrePaciente, citas.fechaHora, citas.motivoConsulta
            FROM citas
            JOIN pacientes ON citas.idPaciente = pacientes.idPaciente
            WHERE citas.idMedico = ? AND DATE(citas.fechaHora) = CURDATE()
        `;

        // Consulta para obtener la lista de todos los pacientes
        const sqlPacientes = 'SELECT * FROM pacientes';

        // Ejecutar ambas consultas
        db.query(sqlCitas, [user.id], (error, citas) => {
            if (error) {
                console.error('Error al obtener las citas:', error);
                return res.status(500).send('Error al cargar el escritorio del médico');
            }

            db.query(sqlPacientes, (error, pacientes) => {
                if (error) {
                    console.error('Error al obtener los pacientes:', error);
                    return res.status(500).send('Error al cargar la lista de pacientes');
                }

                // Renderizar la vista con las citas y los pacientes
                res.render('escritorioMedico', {
                    user: user,
                    citas: citas,
                    pacientes: pacientes || [] // Enviar un array vacío si no hay resultados
                });
            });
        });
    }
});

// Nuevas rutas para manejar los botones de las funcionalidades del médico


// Ruta para mostrar el formulario de registrar evolución
router.get('/registrar-evolucion', authMiddleware.isAuthenticated, authMiddleware.isMedico, (req, res) => {
    res.render('registrarEvolucion', { idPaciente: req.query.idPaciente, paciente: req.query.paciente });
});

// Ruta para procesar el formulario de registrar evolución
router.post('/registrar-evolucion', authMiddleware.isAuthenticated, authMiddleware.isMedico, medicosController.registrarEvolucion);



// Ruta para mostrar el formulario de agregar diagnóstico
router.get('/agregar-diagnostico', authMiddleware.isAuthenticated, authMiddleware.isMedico, (req, res) => {
    res.render('agregarDiagnostico', { idPaciente: req.query.idPaciente, paciente: req.query.paciente });
});

// Ruta para procesar el formulario de agregar diagnóstico
router.post('/agregar-diagnostico', authMiddleware.isAuthenticated, authMiddleware.isMedico, medicosController.agregarDiagnostico);


// Ruta para mostrar el formulario de agregar alergias
router.get('/agregar-alergias', authMiddleware.isAuthenticated, authMiddleware.isMedico, (req, res) => {
    res.render('agregarAlergias', { idPaciente: req.query.idPaciente, paciente: req.query.paciente });
});

// Ruta para procesar el formulario de agregar alergias
router.post('/agregar-alergias', authMiddleware.isAuthenticated, authMiddleware.isMedico, medicosController.agregarAlergias);


// Ruta para mostrar el formulario de registrar antecedentes
router.get('/registrar-antecedentes', authMiddleware.isAuthenticated, authMiddleware.isMedico, (req, res) => {
    res.render('registrarAntecedentes', { idPaciente: req.query.idPaciente, paciente: req.query.paciente });
});

// Ruta para procesar el formulario de registrar antecedentes
router.post('/registrar-antecedentes', authMiddleware.isAuthenticated, authMiddleware.isMedico, medicosController.registrarAntecedentes);
// Ruta para mostrar el formulario de registrar hábitos
router.get('/registrar-habitos', authMiddleware.isAuthenticated, authMiddleware.isMedico, (req, res) => {
    res.render('registrarHabitos', { idPaciente: req.query.idPaciente, paciente: req.query.paciente });
});

// Ruta para procesar el formulario de registrar hábitos
router.post('/registrar-habitos', authMiddleware.isAuthenticated, authMiddleware.isMedico, medicosController.registrarHabitos);
// Ruta para mostrar el formulario de agregar medicamento
router.get('/medicamentos', authMiddleware.isAuthenticated, authMiddleware.isMedico, (req, res) => {
    res.render('agregarMedicamento', { idPaciente: req.query.idPaciente, paciente: req.query.paciente });
});

// Ruta para procesar el formulario de agregar medicamento
router.post('/medicamentos', authMiddleware.isAuthenticated, authMiddleware.isMedico, medicosController.medicamentos);


// Ruta para usar el template de nota
// Ruta para mostrar el formulario del template de nota
router.get('/template-nota', authMiddleware.isAuthenticated, authMiddleware.isMedico, (req, res) => {
    res.render('templateNota', { idPaciente: req.query.idPaciente, paciente: req.query.paciente });
});

// Ruta para procesar el formulario del template de nota
router.post('/template-nota', authMiddleware.isAuthenticated, authMiddleware.isMedico, medicosController.templateNota);


// **Ruta para actualizar un médico por su ID**
router.post('/:id', 
    authMiddleware.isAuthenticated, 
    authMiddleware.isAdmin,   // Solo administrador
    medicosController.update
);

// **Listar todos los médicos**
router.get('/', 
    authMiddleware.isAuthenticated, 
    authMiddleware.isAdmin,   // Solo administrador
    medicosController.listAll
);
// **Escritorio del médico (solo accesible para médicos autenticados)**
router.get('/escritorio', authMiddleware.isAuthenticated, authMiddleware.isMedico, (req, res) => {
    res.render('escritorioMedicos', { user: req.session.user });
});

// **Ruta para cambiar la contraseña del médico**
router.post('/cambiar-contrasena', authMiddleware.isAuthenticated, medicosController.changePassword);

// **Ruta GET para renderizar el formulario de cambio de contraseña**
router.get('/cambiar-contrasena', authMiddleware.isAuthenticated, (req, res) => {
    console.log("Renderizando vista de cambio de contraseña");
    res.render('CDC'); // Renderiza la vista de cambio de contraseña
});

// **Ruta para buscar médicos (accesible para secretarias)**
router.get('/search', authMiddleware.isAuthenticated, authMiddleware.isSecretaria, medicosController.search);

// Ruta para ver el historial de un paciente
router.get('/historial/:idPaciente', authMiddleware.isAuthenticated, (req, res) => {
    medicosController.verHistorialPaciente(req, res);
});

// Nueva ruta para ver el historial general del médico
router.get('/historial', authMiddleware.isAuthenticated, (req, res) => {
   const sql = `
    SELECT 
        citas.idCita, 
        pacientes.nombre AS nombrePaciente, 
        medicos.nombre AS nombreMedico,
        DATE_FORMAT(citas.fechaHora, '%d/%m/%Y %H:%i') AS fechaHora,
        citas.motivoConsulta, 
        citas.estado
    FROM citas
    JOIN pacientes ON citas.idPaciente = pacientes.idPaciente
    JOIN medicos ON citas.idMedico = medicos.idMedico
    WHERE citas.idMedico = ?
    ORDER BY citas.fechaHora DESC
`;


    db.query(sql, [req.session.user.id], (error, results) => {
        if (error) {
            console.error('Error al obtener el historial:', error);
            return res.status(500).send('Error al obtener el historial');
        }

        res.render('historialPaciente', {
            historial: results,
            nombreMedico: req.session.user.nombre
        });
    });
});

// Ruta para iniciar la consulta
router.post('/iniciar/:idCita', citasController.iniciarConsulta);
router.get('/iniciar-consulta/:idCita', citasController.cargarConsulta);

module.exports = router;
