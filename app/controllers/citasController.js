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
// Obtener citas en formato JSON para FullCalendar
exports.obtenerCitasJSON = async (req, res) => {
    try {
      const medicoId = req.query.id; // Ajuste aquí para recibir el ID desde el query
      const [citas] = await db.promise().query(
        `SELECT fechaHora AS start, motivoConsulta AS title 
         FROM citas 
         WHERE idMedico = ?`, [medicoId]
      );
      res.json(citas);
    } catch (error) {
      console.error('Error al obtener citas:', error);
      res.status(500).send('Error al obtener citas');
    }
  };
// Mostrar formulario para una nueva cita
exports.showNewForm = (req, res) => {
    const sqlMedicos = 'SELECT * FROM medicos';

    db.query(sqlMedicos, (error, resultsMedicos) => {
        if (error) {
            console.error('Error al obtener los médicos:', error);
            return res.status(500).send('Error al obtener los médicos');
        }

        if (resultsMedicos.length === 0) {
            console.log('No se encontraron médicos en la base de datos.');
            return res.status(404).send('No hay médicos disponibles.');
        }

        // Renderiza la vista con la lista de médicos
        res.render('newCita', { medicos: resultsMedicos });
    });
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
  // Nueva función para crear una cita
exports.createCita = (req, res) => {
    const { idPaciente, idMedico, fechaHora, motivoConsulta } = req.body;

    if (!idPaciente || !idMedico) {
        return res.status(400).send('Paciente o médico no seleccionado.');
    }

    const sqlCita = `
        INSERT INTO citas (idPaciente, idMedico, fechaHora, motivoConsulta) 
        VALUES (?, ?, ?, ?)
    `;

    db.query(sqlCita, [idPaciente, idMedico, fechaHora, motivoConsulta], (error, result) => {
        if (error) {
            console.error('Error al crear la cita:', error);
            return res.status(500).send('Error al crear la cita');
        }
        res.redirect('/citas');  // Redirige a la lista de citas después de la creación
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
exports.verAgenda = (req, res) => {
    const idMedico = req.params.id;

    const sql = `
        SELECT citas.idCita, pacientes.nombre AS nombrePaciente, citas.fechaHora, citas.motivoConsulta, citas.estado 
        FROM citas
        JOIN pacientes ON citas.idPaciente = pacientes.idPaciente
        WHERE citas.idMedico = ?
    `;

    db.query(sql, [idMedico], (error, results) => {
        if (error) {
            console.error('Error al obtener la agenda del médico:', error);
            return res.status(500).send('Error al obtener la agenda del médico');
        }

        // Formatear la fecha y hora para mostrar correctamente en la vista
        results.forEach(cita => {
            const fecha = new Date(cita.fechaHora);
            cita.fechaHora = `${fecha.getDate()}/${fecha.getMonth() + 1}/${fecha.getFullYear()} 
                              ${fecha.getHours().toString().padStart(2, '0')}:${fecha.getMinutes().toString().padStart(2, '0')}`;
        });

        res.render('agenda_medico', {
            citas: results,
            nombreMedico: results.length > 0 ? results[0].nombreMedico : 'Médico sin citas'
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
    