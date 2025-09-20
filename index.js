require('dotenv').config();
 
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const config = require('./config/config');
const mysql = require('mysql2');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const methodOverride = require('method-override');
const http = require('http');
const socketIo = require('socket.io');
const router = express.Router();
const historiasController = require('./app/controllers/historiasController');
const medicosController = require('./app/controllers/medicosController');
const citasController = require('./app/controllers/citasController');
const authController = require('./app/controllers/authController');
const { isAuthenticated, isPacienteOrMedico } = require('./middleware/roleMiddleware');
const notificaciones = require('./utils/notificaciones');



// Inicializar Express
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
notificaciones.init(io);
const port = 3000;

// Configuración del motor de vistas
app.set('view engine', 'pug');
app.set('views', './app/views');

// Middlewares para archivos estáticos y manejo de datos
app.use(express.static('public'));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compression());
app.use(methodOverride('_method'));

// Configuración de sesiones
app.use(session({
    secret: 'tu_secreto', // Cambia esto a una clave más segura en producción
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 3600000 } // Añadir opciones adicionales
}));

// Middleware para gestionar sesiones de usuarios
app.use((req, res, next) => {
    console.log('Sesión completa:', req.session);
    console.log('Usuario en sesión:', req.session.user);
    console.log('Clínica seleccionada en sesión:', req.session.idClinica);
    res.locals.user = req.session.user; // Disponible en todas las vistas Pug
    res.locals.clinicaSeleccionada = req.session.idClinica || false;
    
    next();
});

// Definir rutas principales

app.get('/saludplus', (req, res) => {
    req.session.clinicaSeleccionada = true;
    res.render('layout', { title: 'Clínica Integral SaludPlus', clinicaSeleccionada: true });
});
app.get('/vidatotal', (req, res) => {
    req.session.clinicaSeleccionada = true;
    res.render('layout', { title: 'Centro Médico Vida Total', clinicaSeleccionada: true });
});
// Registrar las rutas de especialidades
const especialidadesRouter = require('./routes/especialidades');
app.use('/especialidades', especialidadesRouter);
// Registrar las rutas de secretaria
const secretariaRoutes = require('./routes/secretaria');
app.use('/secretaria', secretariaRoutes);
// Registrar las rutas de autenticación
const authRoutes = require('./routes/auth');
app.use('/', authRoutes);
// Registrar las rutas del administrador (nuevo archivo de rutas)
const adminRoutes = require('./routes/admin');
app.use('/admin', adminRoutes);
// Ruta para mostrar el formulario de selección de clínica
app.get('/select-clinica', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login'); // Si no hay usuario, redirigir al login
    }

    if (req.session.user.role === 'secretaria') {
        return res.redirect('/secretaria/pacientes'); // Las secretarias van directo a pacientes
    }

    res.render('selectClinica', { clinicaSeleccionada: req.session.idClinica || false });
});

// Ruta para manejar la selección de clínica
app.post('/seleccionar-clinica', authController.seleccionarClinica);
// Registrar las rutas de pacientes
const pacientesRouter = require('./routes/pacientes');
app.use('/pacientes', pacientesRouter);
app.use('/paciente', pacientesRouter);
app.use('/registro-pendiente', pacientesRouter);
app.get('/test-listado-medicos', (req, res) => {
    res.render('listadoMedicos'); 
});

// Registrar las rutas de médicos
const medicosRoutes = require('./routes/medicos');
app.use('/medicos', medicosRoutes);
// Ruta para ver el historial de consultas de un paciente (puede ser accesible por médicos o pacientes)
app.get('/medicos/historial/:idPaciente', isAuthenticated, (req, res) => {
    console.log(`Accediendo al historial del paciente con ID: ${req.params.idPaciente}`);
    medicosController.verHistorialPaciente(req, res); // Llama al controlador para manejar la lógica
});
// Registrar las rutas de citas
const citasRoutes = require('./routes/citas');
app.use('/citas', citasRoutes);

// Registrar las rutas de historial clínico
const historiasRoutes = require('./routes/historias');
app.get('/historias/:idPaciente?', isAuthenticated, isPacienteOrMedico, (req, res) => {
    const role = req.session.user.role?.toLowerCase();

    if (role === 'paciente') {
        // Paciente: siempre ve SU propio historial
        return historiasController.listAll(req, res);
    } else if (role === 'medico') {
        if (req.params.idPaciente) {
            // Médico con ID específico → historial del paciente
            return medicosController.verHistorialPaciente(req, res);
        } else {
            // Médico sin ID → pedir selección de paciente
            return res.status(400).send('Debe especificar un paciente: /historias/:idPaciente');
        }
    }
});


// Ruta para ver mis turnos
app.get('/turnos/mis-turnos', isAuthenticated, citasController.listarMisTurnos);

// Endpoint para agregar un nuevo registro médico
app.post('/addMedicalRecord', async (req, res) => {
    try {
        const newRecord = {
            pacientesName: req.body.pacientesName,
            condition: req.body.condition,
            treatment: req.body.treatment,
            dateOfVisit: req.body.dateOfVisit || new Date(),
            notes: req.body.notes
        };

        const resultId = await MedicalRecord.create(newRecord);
        res.status(201).send({ message: "Registro médico creado con éxito", id: resultId });
    } catch (error) {
        console.error('Error al procesar la solicitud:', error.message);
        res.status(500).send("Error al insertar el registro médico");
    }
});
 
// Ruta de inicio
// Marcar citas pasadas como completadas al iniciar la aplicación
citasController.marcarCitasCompletadas();
app.get('/', (req, res) => {
    if (!req.session.user) {
        // Si no hay usuario en la sesión, renderiza el formulario para seleccionar la clínica
        return res.render('layout', { title: 'TurnoExpress', clinicaSeleccionada: false });
    }
    
    // Si hay un usuario autenticado, renderiza la página principal con la clínica seleccionada
    res.render('layout', { title: 'TurnoExpress', clinicaSeleccionada: true });
});
// Iniciar el servidor
server.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
    console.log('Rutas y middlewares configurados correctamente.');
});
