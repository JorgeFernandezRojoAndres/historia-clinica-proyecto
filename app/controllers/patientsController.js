// app/controllers/patientsController.js
const db = require('../../config/database');

exports.listAll = (req, res) => {
    const sql = 'SELECT idPaciente, nombre, fechaNacimiento, dni, direccion, telefono FROM pacientes';
    db.query(sql, (error, results) => {
        if (error) {
            console.error('Error al obtener los pacientes:', error);
            res.status(500).send("Error al obtener los pacientes");
        } else {
            // Formatear las fechas para mostrarlas en español
            results.forEach(patient => {
                patient.fechaNacimiento = new Date(patient.fechaNacimiento).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            });
            res.render('patients', { patients: results });
        }
    });
};

exports.showNewForm = (req, res) => {
    res.render('new_patient');

};

exports.create = (req, res) => {
    const { nombre, fechaNacimiento, dni, direccion, telefono } = req.body;

    const sql = 'INSERT INTO pacientes (nombre, fechaNacimiento, dni, direccion, telefono) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [nombre, fechaNacimiento, dni, direccion, telefono], (error, results) => {
        if (error) {
            console.error('Error al crear el paciente:', error);
            res.status(500).send("Error al crear el paciente");
        } else {
            res.redirect('/patients'); // Redirige a la lista de pacientes tras crear uno nuevo
        }
    });
};


exports.showEditForm = (req, res) => {
    const id = req.params.id;
    const sql = 'SELECT * FROM pacientes WHERE idPaciente = ?';
    db.query(sql, [id], (error, results) => {
        if (error) {
            console.error('Error al obtener el paciente:', error);
            res.status(500).send("Error al obtener el paciente");
        } else {
            res.render('edit_patient', { patient: results[0] }); // Renderiza la vista de edición con los datos del paciente
        }
    });
};


exports.update = (req, res) => {
    const { nombre, fechaNacimiento, dni, direccion, telefono } = req.body;
    const id = req.params.id;

    const sql = 'UPDATE pacientes SET nombre = ?, fechaNacimiento = ?, dni = ?, direccion = ?, telefono = ? WHERE idPaciente = ?';
    db.query(sql, [nombre, fechaNacimiento, dni, direccion, telefono, id], (error, results) => {
        if (error) {
            console.error('Error al actualizar el paciente:', error);
            res.status(500).send("Error al actualizar el paciente");
        } else {
            res.redirect('/patients'); // Redirige a la lista de pacientes después de actualizar
        }
    });
};


exports.delete = (req, res) => {
    const id = req.params.id;

    const sql = 'DELETE FROM pacientes WHERE idPaciente = ?';
    db.query(sql, [id], (error, results) => {
        if (error) {
            console.error('Error al eliminar el paciente:', error);
            res.status(500).send("Error al eliminar el paciente");
        } else {
            res.redirect('/patients'); // Redirige a la lista de pacientes después de eliminar
        }
    });
};



exports.buscarPaciente = (req, res) => {
    const dni = req.params.dni;
    const sql = `SELECT p.nombre, hc.detalles 
                 FROM pacientes p 
                 LEFT JOIN historias_clinicas hc 
                 ON p.idPaciente = hc.idPaciente 
                 WHERE p.dni = ?`;
    
    db.query(sql, [dni], (error, results) => {
        if (error) {
            return res.status(500).json({ success: false, message: 'Error al buscar paciente' });
        }
        if (results.length > 0) {
            const paciente = results[0];
            res.json({ 
                success: true, 
                nombre: paciente.nombre, 
                detalles: paciente.detalles || 'Sin historial clínico'
            });
        } else {
            res.json({ success: false, message: 'Paciente no encontrado' });
        }
    });
};

  

