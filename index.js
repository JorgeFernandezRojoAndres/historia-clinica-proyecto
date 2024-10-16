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
// Ruta para obtener los eventos del calendario del médico
app.get('/api/medicos/:id/agenda', (req, res) => {res.redirect(`/api/medicos/${req.query.id}/agenda`);
});


// Middlewares adicionales
app.use(logger('dev')); // Registro de solicitudes HTTP
app.use(express.json()); // Parseo de JSON
app.use(express.urlencoded({ extended: true })); // Parseo de datos de formularios
app.use(cookieParser()); // Manejo de cookies
app.use(compression()); // Compresión de respuestas
app.use(methodOverride('_method'));// Soporte para otros métodos HTTP como PUT y DELETE

// Configurar las sesiones
app.use(session({
    secret: 'tu_secreto', // Cambia esto por una clave segura
    resave: false,
    saveUninitialized: false
}));

// Middleware para gestionar sesiones de usuarios
app.use((req, res, next) => {
    res.locals.user = req.session.user;  // Esto estará disponible en todas las vistas Pug
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

// Importa las rutas de secretaria
const secretariaRoutes = require('./routes/secretaria');
app.use('/secretaria', secretariaRoutes);




// Importa las rutas de pacientes
const pacientesRoutes = require('./routes/pacientes');
app.use('/paciente', pacientesRoutes);


// Importar las rutas de medicos
const medicosRoutes = require('./routes/medicos');
app.use('/medicos', medicosRoutes);

// Importa las rutas de citas
const citasRoutes = require('./routes/citas');
app.use('/citas', citasRoutes);

// Importa las rutas de Historial Clinico
const historiasRoutes = require('./routes/historias');
app.use('/historias', historiasRoutes);

// Registra las rutas de autenticación
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

// Iniciar el servidor
app.listen(3000, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
