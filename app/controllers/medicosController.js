// app/controllers/medicosController.js
const db = require('../../config/database');

exports.listAll = (req, res) => {
    const sql = 'SELECT idMedico, nombre, especialidad FROM medicos';
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
    const { nombre, especialidad } = req.body;
    const sql = 'INSERT INTO medicos (nombre, especialidad) VALUES (?, ?)';
    db.query(sql, [nombre, especialidad], (error, results) => {
        if (error) {
            console.error('Error al crear el médico:', error);
            res.status(500).send("Error al crear el médico");
        } else {
            res.redirect('/medicos');  // Redirige a la lista de médicos después de crear
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
    const { nombre, especialidad } = req.body;
    const sql = 'UPDATE medicos SET nombre = ?, especialidad = ? WHERE idMedico = ?';
    db.query(sql, [nombre, especialidad, idMedico], (error, results) => {
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
