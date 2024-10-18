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
            console.log('Citas obtenidas:', results);
            // Formatear las fechas para mostrarlas en el frontend
            results.forEach(cita => {
                const fecha = new Date(cita.fechaHora);
                cita.fechaHora = `${fecha.getDate()}/${fecha.getMonth() + 1}/${fecha.getFullYear()} ${fecha.getHours().toString().padStart(2, '0')}:${fecha.getMinutes().toString().padStart(2, '0')}`;
            });
            // Renderizar en el frontend (lista o tabla de citas)
            res.render('citas', { citas: results });
        }
    });
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
exports.createCita = (req, res) => {
    const { idPaciente, idMedico, fechaHora, motivoConsulta } = req.body;

    console.log('Creando cita con los siguientes datos:', { idPaciente, idMedico, fechaHora, motivoConsulta });

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
        console.log('Cita creada exitosamente:', result);
        res.redirect('/citas');
    });
};

// Editar una cita
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

// Obtener citas en formato JSON 
exports.obtenerCitasJSON = (req, res) => {
    const medicoId = req.params.id;                                                                                                                                    
    console.log('ID del médico:', medicoId);

    const sql = `
        SELECT fechaHora, motivoConsulta
        FROM citas
        WHERE idMedico = ?
    `;

    db.query(sql, [medicoId], (error, results) => {
        if (error) {
            console.error('Error al obtener las citas:', error);
            return res.status(500).send('Error al obtener las citas');
        }

        if (results.length === 0) {
            console.log('No se encontraron citas para el médico:', medicoId);
            return res.json([]); // Devuelve un array vacío si no hay citas
        }

        // Formatear cada resultado antes de enviarlo
        const citasFormateadas = results.map(cita => {
            return {
                fecha: new Date(cita.fechaHora).toLocaleString(), // Formato legible de la fecha
                motivo: cita.motivoConsulta || 'No especificado'  // Verifica que el motivo exista
            };
        });

        console.log('Citas formateadas:', citasFormateadas); // Verificar los resultados
        res.json(citasFormateadas); // Devolver citas formateadas como JSON
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
