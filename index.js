const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const config = require('./config/config');
const mysql = require('mysql2');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const methodOverride = require('method-override');

const app = express();
const port = 3000;

// Configuración del motor de vistas
app.set('view engine', 'pug');
app.set('views', './app/views');

// Configurar la carpeta de archivos estáticos
app.use(express.static('public'));

// Middlewares adicionales
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compression());
app.use(methodOverride('_method'));

// Configurar las sesiones
app.use(session({
    secret: 'tu_secreto', // Cambia esto por una clave segura
    resave: false,
    saveUninitialized: false
}));

// Requerir controladores y middlewares antes de usarlos
const citasController = require('./app/controllers/citasController');
const { isAuthenticated, isPaciente } = require('./middleware/roleMiddleware');

// Middleware para gestionar sesiones de usuarios
app.use((req, res, next) => {
    res.locals.user = req.session.user; // Esto estará disponible en todas las vistas Pug
    next();
});

// Definir rutas
app.get('/', (req, res) => {
    res.render('layout', { title: 'TurnoExpress' });
});

app.get('/saludplus', (req, res) => {
    req.session.clinicaSeleccionada = true;
    res.render('layout', { title: 'Clínica Integral SaludPlus', clinicaSeleccionada: true });
});

app.get('/vidatotal', (req, res) => {
    req.session.clinicaSeleccionada = true;
    res.render('layout', { title: 'Centro Médico Vida Total', clinicaSeleccionada: true });
});

app.use((req, res, next) => {
    res.locals.clinicaSeleccionada = req.session.clinicaSeleccionada || false;
    next();
});

// Registrar las rutas de especialidades
const especialidadesRouter = require('./routes/especialidades');
app.use('/especialidades', especialidadesRouter);

// Importar y registrar las rutas de secretaria
const secretariaRoutes = require('./routes/secretaria');
app.use('/secretaria', secretariaRoutes);

// Importar y registrar las rutas de pacientes
const pacientesRouter = require('./routes/pacientes');
app.use('/pacientes', pacientesRouter);



// Ruta para ver mis turnos
app.get('/turnos/mis-turnos', isAuthenticated, citasController.listarMisTurnos);

// Importar y registrar las rutas de médicos
const medicosRoutes = require('./routes/medicos');
app.use('/medicos', medicosRoutes);

// Importar y registrar las rutas de citas
app.get('/api/medicos/:id/agenda', citasController.obtenerCitasJSON);

const citasRoutes = require('./routes/citas');
app.use('/citas', citasRoutes);

// Registrar las rutas de historial clínico
const historiasRoutes = require('./routes/historias');
app.use('/historias', isAuthenticated, isPaciente, historiasRoutes);

// Registrar las rutas de autenticación
const authRoutes = require('./routes/auth');
app.use('/', authRoutes);

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
// Marcar citas pasadas como completadas al iniciar la aplicación
citasController.marcarCitasCompletadas();
// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
