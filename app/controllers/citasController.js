const db = require('../../config/database');

// Listar todas las citas
exports.listAll = (req, res) => {
    const sql = `
        SELECT citas.idCita, medicos.nombre AS nombreMedico, pacientes.nombre AS nombrePaciente, citas.fechaHora, citas.motivoConsulta, citas.estado
        FROM citas
        JOIN medicos ON citas.idMedico = medicos.idMedico
        JOIN pacientes ON citas.idPaciente = pacientes.idPaciente
    `;
    db.query(sql, (error, results) => {
        if (error) {
            console.error('Error al obtener las citas:', error);
            res.status(500).send("Error al obtener las citas");
        } else {
            // Formatear las fechas
            results.forEach(cita => {
                const fecha = new Date(cita.fechaHora);
                cita.fechaHora = `${fecha.getDate()}/${fecha.getMonth() + 1}/${fecha.getFullYear()} ${fecha.getHours().toString().padStart(2, '0')}:${fecha.getMinutes().toString().padStart(2, '0')}`;
            });
            res.render('citas', { citas: results });
        }
    });
};

// Mostrar formulario para una nueva cita
exports.showNewForm = (req, res) => {
    res.render('newCita'); // Asegúrate de tener la vista 'newCita.pug' creada en la carpeta de vistas
};

// Crear una nueva cita
exports.create = (req, res) => {
    const {
      dniPaciente,
      detalles,
      fechaDiagnostico,
      medicamentos,
      alergias,
      condicionActual,
      pruebasDiagnosticas,
      fechaProximaCita,
      urlDocumento,
      notasMedicas,
      especialistaReferido
    } = req.body;
  
    const sqlPaciente = 'SELECT idPaciente FROM pacientes WHERE dni = ?';
    db.query(sqlPaciente, [dniPaciente], (error, results) => {
        if (error) {
            console.error('Error al buscar paciente:', error);
            return res.status(500).send('Error al buscar paciente');
        }
  
        if (results.length === 0) {
            return res.status(404).send('Paciente no encontrado');
        }
  
        const idPaciente = results[0].idPaciente;
        const sqlHistoria = `
          INSERT INTO historias_clinicas 
          (idPaciente, detalles, fechaDiagnostico, medicamentos, alergias, condicionActual, pruebasDiagnosticas, fechaProximaCita, urlDocumento, notasMedicas, especialistaReferido)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        db.query(sqlHistoria, [idPaciente, detalles, fechaDiagnostico, medicamentos, alergias, condicionActual, pruebasDiagnosticas, fechaProximaCita, urlDocumento, notasMedicas, especialistaReferido], (error, result) => {
            if (error) {
                console.error('Error al crear la historia clínica:', error);
                return res.status(500).send('Error al crear la historia clínica');
            }
  
            res.redirect('/historias_clinicas');
        });
    });
  };
  

  exports.showEditForm = (req, res) => {
    const id = req.params.id;

    const sqlCita = 'SELECT * FROM citas WHERE idCita = ?';
    db.query(sqlCita, [id], (errorCita, resultsCita) => {
        if (errorCita) {
            console.error('Error al obtener la cita:', errorCita);
            return res.status(500).send("Error al obtener la cita");
        }
        // Formatear la fecha al formato compatible con datetime-local
        resultsCita[0].fechaHora = new Date(resultsCita[0].fechaHora).toISOString().slice(0, 16);

        const sqlMedicos = 'SELECT * FROM medicos';
        const sqlPacientes = 'SELECT * FROM pacientes';

        db.query(sqlMedicos, (errorMedicos, resultsMedicos) => {
            if (errorMedicos) {
                console.error('Error al obtener los médicos:', errorMedicos);
                return res.status(500).send("Error al obtener los médicos");
            }
            

            db.query(sqlPacientes, (errorPacientes, resultsPacientes) => {
                if (errorPacientes) {
                    console.error('Error al obtener los pacientes:', errorPacientes);
                    return res.status(500).send("Error al obtener los pacientes");
                }

                // Renderizar la vista con cita, médicos y pacientes
                res.render('editCita', {
                    cita: resultsCita[0],
                    medicos: resultsMedicos,
                    pacientes: resultsPacientes
                });
            });
        });
    });
};




// Actualizar una cita
exports.update = (req, res) => {
    const id = req.params.id;
    const { idMedico, idPaciente, fechaHora, motivoConsulta } = req.body;
    
    const sql = 'UPDATE citas SET idMedico = ?, idPaciente = ?, fechaHora = ?, motivoConsulta = ? WHERE idCita = ?';
    db.query(sql, [idMedico, idPaciente, fechaHora, motivoConsulta, id], (error, results) => {
        if (error) {
            console.error('Error al actualizar la cita:', error);
            res.status(500).send("Error al actualizar la cita");
        } else {
            res.redirect('/citas');
        }
    });
};

// Eliminar una cita
exports.delete = (req, res) => {
    const id = req.params.id;
    const sql = 'DELETE FROM citas WHERE idCita = ?';
    db.query(sql, [id], (error, results) => {
        if (error) {
            console.error('Error al eliminar la cita:', error);
            res.status(500).send("Error al eliminar la cita");
        } else {
            res.redirect('/citas');
        }
    });
};
    