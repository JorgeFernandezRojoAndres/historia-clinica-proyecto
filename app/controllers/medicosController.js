const moment = require('moment'); 
// app/controllers/medicosController.js
const db = require('../../config/database');

exports.listAll = (req, res) => {
    const sql = 'SELECT idMedico, nombre, especialidad, telefono, email, dni FROM medicos';
    db.query(sql, (error, results) => {
        if (error) {
            console.error('Error al obtener los médicos:', error);
            res.status(500).send("Error al obtener los médicos");
        } else {
            res.render('medicos', { medicos: results });
        }
    });
};


exports.showNewForm = (req, res) => {
    res.render('newMedico');  
};

exports.create = (req, res) => {
    const { nombre, especialidad, dni, telefono, email } = req.body;
    const sql = 'INSERT INTO medicos (nombre, especialidad, dni, telefono, email) VALUES (?, ?, ?, ?, ?)';
    
    db.query(sql, [nombre, especialidad, dni, telefono, email], (error, results) => {
        if (error) {
            console.error('Error al crear el médico:', error);
            res.status(500).send("Error al crear el médico");
        } else {
            res.redirect('/medicos');
        }
    });
};




exports.showEditForm = (req, res) => {
    const sql = 'SELECT * FROM medicos WHERE idMedico = ?';
    db.query(sql, [req.params.id], (error, results) => {
        if (error) {
            console.error('Error al obtener los datos del médico:', error);
            res.status(500).send("Error al obtener los datos del médico");
        } else {
            res.render('editMedico', { medico: results[0] });
        }
    });
};


exports.update = (req, res) => {
    const idMedico = req.params.id;
    const { nombre, especialidad, dni, telefono, email } = req.body;
    const sql = 'UPDATE medicos SET nombre = ?, especialidad = ?, dni = ?, telefono = ?, email = ? WHERE idMedico = ?';

    db.query(sql, [nombre, especialidad, dni, telefono, email, idMedico], (error, results) => {
        if (error) {
            console.error('Error al actualizar el médico:', error);
            res.status(500).send("Error al actualizar el médico");
        } else {
            res.redirect('/medicos');
        }
    });
};



exports.delete = (req, res) => {
    const idMedico = req.params.id;
    const sql = 'DELETE FROM medicos WHERE idMedico = ?';
    db.query(sql, [idMedico], (error, results) => {
        if (error) {
            console.error('Error al eliminar el médico:', error);
            res.status(500).send("Error al eliminar el médico");
        } else {
            res.redirect('/medicos');
        }
    });
};



// Obtener la agenda del médico con sus citas del día actual
exports.verAgenda = (req, res) => {
    const idMedico = req.params.id;
    const sql = `
        SELECT citas.*, medicos.nombre AS nombreMedico, pacientes.nombre AS nombrePaciente 
        FROM citas 
        JOIN medicos ON citas.idMedico = medicos.idMedico 
        JOIN pacientes ON citas.idPaciente = pacientes.idPaciente 
        WHERE citas.idMedico = ?`;
        
    db.query(sql, [idMedico], (error, results) => {
        if (error) {
            console.error('Error al obtener la agenda del médico:', error);
            return res.status(500).send('Error al obtener la agenda del médico');
        }

        // Formatear las fechas usando moment.js
        results.forEach(cita => {
            cita.fechaHora = moment(cita.fechaHora).format('DD/MM/YYYY HH:mm'); // Formato: 10/10/2024 09:00
        });

        res.render('agenda_medico', { citas: results, nombreMedico: results[0]?.nombreMedico });
    });
};

exports.search = (req, res) => {
    const query = req.query.query;
    const sql = 'SELECT * FROM medicos WHERE nombre LIKE ?';
    const searchTerm = `%${query}%`;

    db.query(sql, [searchTerm], (error, results) => {
        if (error) {
            console.error('Error al buscar médicos:', error);
            return res.status(500).send('Error al buscar médicos');
        }

        // Renderizar la vista completa con la estructura de la aplicación y los resultados
        res.render('medicos', { medicos: results });
    });
};



  


