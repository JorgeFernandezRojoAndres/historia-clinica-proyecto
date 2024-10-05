const express = require('express');
const config = require('./config/config');
const mysql = require('mysql2');
// Inicializa la aplicación
const app = express();
const port = 3000;

// Configuración del motor de vistas
app.use(express.static('public'));

app.set('view engine', 'pug');
app.set('views', './app/views');
// Middleware para parsear el cuerpo de las solicitudes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get('/', (req, res) => {
    res.render('layout', { title: 'Aplicación Médica' });
});

// Importa las rutas de pacientes
const patientsRoutes = require('./routes/patients');
app.use('/patients', patientsRoutes);
//Importar las rutas de medicos
const medicosRoutes = require('./routes/medicos'); 
app.use('/medicos', medicosRoutes); 
// Importa las rutas de citas
const citasRoutes = require('./routes/citas');
app.use('/citas', citasRoutes);
// Importa las rutas de Historial Clinico
const historiasRoutes = require('./routes/historias');
app.use('/historias_clinicas', historiasRoutes);




app.post('/addMedicalRecord', async (req, res) => {
    try {
        const newRecord = {
            patientName: req.body.patientName,
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
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
