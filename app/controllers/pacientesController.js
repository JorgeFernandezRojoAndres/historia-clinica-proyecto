// app/controllers/pacientesController.js
const db = require('../../config/database');

exports.listAll = (req, res) => {
    const sql = 'SELECT idPaciente, nombre, fechaNacimiento, dni, direccion, telefono FROM pacientes';
    db.query(sql, (error, results) => {
      if (error) {
        console.error('Error al obtener los pacientes:', error);
        return res.status(500).send('Error al obtener los pacientes');
      }
  
      results.forEach(paciente => {
        paciente.fechaNacimiento = new Date(paciente.fechaNacimiento).toLocaleDateString('es-ES', {
          year: 'numeric', month: 'long', day: 'numeric'
        });
      });
  
      // Verificar si la solicitud es AJAX
      if (req.xhr) {
        return res.json(results); // Devolver JSON si es AJAX
      }
  
      res.render('pacientes', { pacientes: results }); // Renderizar la vista si es navegación normal
    });
  };
  

exports.showNewForm = (req, res) => {
    res.render('new_pacientes');

};

exports.create = (req, res) => {
    const { nombre, fechaNacimiento, dni, direccion, telefono } = req.body;

    const sql = 'INSERT INTO pacientes (nombre, fechaNacimiento, dni, direccion, telefono) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [nombre, fechaNacimiento, dni, direccion, telefono], (error, results) => {
        if (error) {
            console.error('Error al crear el paciente:', error);
            res.status(500).send("Error al crear el paciente");
        } else {
            res.redirect('/pacientes'); // Redirige a la lista de pacientes tras crear uno nuevo
        }
    });
};


exports.showEditForm = (req, res) => {
    const id = req.params.id;
    const sql = 'SELECT * FROM pacientes WHERE idPaciente = ?';

    db.query(sql, [id], (error, results) => {
        if (error) {
            console.error('Error al obtener el paciente:', error);
            return res.status(500).send('Error al obtener el paciente');
        }

        if (results.length === 0) {
            return res.status(404).send('Paciente no encontrado');
        }

        // Formatear la fecha de nacimiento en formato ISO para el campo 'date'
        results[0].fechaNacimiento = new Date(results[0].fechaNacimiento).toISOString().split('T')[0];

        res.render('editPaciente', { paciente: results[0] });
    });
};


exports.update = (req, res) => {
    const { nombre, fechaNacimiento, dni, direccion, telefono } = req.body;
    const id = req.params.id;

    const sql = 'UPDATE pacientes SET nombre = ?, fechaNacimiento = ?, dni = ?, direccion = ?, telefono = ? WHERE idPaciente = ?';
    db.query(sql, [nombre, fechaNacimiento, dni, direccion, telefono, id], (error, results) => {
        if (error) {
            console.error('Error al actualizar el paciente:', error);
            return res.status(500).send("Error al actualizar el paciente");
        }

        // Redirigir según el rol del usuario
        if (req.session.user.role === 'secretaria') {
            res.redirect('/secretaria/pacientes'); // Redirige a la lista de pacientes si es secretaria
        } else if (req.session.user.role === 'paciente') {
            res.redirect('/paciente/mi-perfil'); // Redirige al perfil del paciente
        } else {
            res.redirect('/'); // Redirige a la página principal por defecto (opcional)
        }
    });
};



exports.delete = (req, res) => {
    console.log('Intentando eliminar paciente con ID:', req.params.id);
    const id = req.params.id;
    const sql = 'DELETE FROM pacientes WHERE idPaciente = ?';

    db.query(sql, [id], (error, results) => {
        if (error) {
            console.error('Error al eliminar el paciente:', error);
            return res.status(500).send('Error al eliminar el paciente');
        }
        res.redirect('/secretaria/pacientes');
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

exports.search = (req, res) => {
    const query = req.query.query || ''; // Asegura que no sea undefined
    console.log("Ejecutando búsqueda de pacientes con query:", query);

    if (query.trim().length === 0) {
        return res.status(400).json({ message: 'La búsqueda no puede estar vacía.' });
    }

    const searchTerm = `%${query}%`;
    const sql = 'SELECT * FROM pacientes WHERE nombre LIKE ?';

    db.query(sql, [searchTerm], (error, results) => {
        if (error) {
            console.error('Error al buscar pacientes:', error);
            return res.status(500).send('Error al buscar pacientes');
        }

        console.log("Resultados de búsqueda:", results);

        if (results.length > 0) {
            res.json(results); // Devuelve resultados como JSON
        } else {
            res.json({ message: 'No se encontraron pacientes.' });
        }
    });
};




exports.showProfile = (req, res) => { 
    const idPaciente = req.session.user.id; // Obtener el ID del paciente de la sesión

    const sql = 'SELECT * FROM pacientes WHERE idPaciente = ?';
    db.query(sql, [idPaciente], (error, results) => {
        if (error) {
            return res.status(500).send('Error al buscar paciente');
        }
        if (results.length > 0) {
            res.render('perfilPaciente', { paciente: results[0] }); // Renderiza la vista de perfil del paciente
        } else {
            res.status(404).send('Paciente no encontrado');
        }
    });
};


