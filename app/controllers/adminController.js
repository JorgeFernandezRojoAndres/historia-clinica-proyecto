const bcrypt = require('bcryptjs'); 
const db = require('../../config/database');
const { agregarHorarioLibre, generarHorariosLibres } = require('../../utils/horariosLibres');
const { repetirHorarios } = require('../../utils/repetirHorarios');

const moment = require('moment');

// Función para ver los horarios libres de un médico específico
exports.verHorariosLibres = (req, res) => {
    const { idMedico } = req.params; // Obtener el ID del médico desde la URL
    const fecha = moment().format('YYYY-MM-DD'); // Fecha actual
    const horaActual = moment().format('HH:mm'); // Hora actual

    // Primero, obtenemos el nombre del médico
    const sqlNombreMedico = 'SELECT nombre FROM medicos WHERE idMedico = ?';
    db.query(sqlNombreMedico, [idMedico], (error, resultadosMedico) => {
        if (error) {
            console.error('Error al obtener el nombre del médico:', error);
            return res.status(500).send('Error al obtener el nombre del médico');
        }

        if (resultadosMedico.length === 0) {
            return res.status(404).send('Médico no encontrado');
        }

        const nombreMedico = resultadosMedico[0].nombre;

        // Luego, obtenemos las citas para ese médico en la fecha actual
        const sqlCitas = 'SELECT fechaHora FROM citas WHERE idMedico = ? AND DATE(fechaHora) = ?';
        db.query(sqlCitas, [idMedico, fecha], (error, citas) => {
            if (error) {
                console.error('Error al obtener citas del médico:', error);
                return res.status(500).send('Error al obtener citas del médico');
            }

            // Obtener los horarios libres, excluyendo las citas
            let horariosLibres = generarHorariosLibres(fecha, citas); // Generar horarios iniciales

            // Filtrar los horarios que ya pasaron respecto a la hora actual
            horariosLibres = horariosLibres.filter(horario => {
                const horarioFechaHora = moment(`${horario.fecha} ${horario.hora}`, 'DD/MM/YYYY HH:mm');
                return horarioFechaHora.isAfter(moment()); // Filtra solo los horarios que son después de la hora actual
            });

            // Verificar si el parámetro 'eliminado' está presente en la URL (indica que un horario fue eliminado)
            if (req.query.fecha && req.query.hora) {
                const fechaEliminada = req.query.fecha;
                const horaEliminada = req.query.hora;
                
                // Filtrar los horarios eliminados, ya que no deben volver a aparecer
                horariosLibres = horariosLibres.filter(horario => 
                    !(horario.fecha === fechaEliminada && horario.hora === horaEliminada)
                );
            }

            // Si no hay horarios disponibles, mostrar mensaje
            if (horariosLibres.length === 0) {
                return res.render('verHorarios', { horariosLibres, idMedico, nombreMedico, noHayHorarios: true });
            }

            console.log("Horarios libres generados:", horariosLibres);

            // Finalmente, renderizamos la vista con los horarios libres y el nombre del médico
            res.render('verHorarios', { horariosLibres, idMedico, nombreMedico });
        });
    });
};




exports.agregarHorarioLibre = (req, res) => {
    const { idMedico, fecha, horaInicio, horaFin } = req.body;
    const tipoTurno = 'libre';

    // Validación para que horaFin no sea anterior a horaInicio
    if (moment(horaFin, 'HH:mm').isBefore(moment(horaInicio, 'HH:mm'))) {
        return res.status(400).send('La hora de fin debe ser posterior a la hora de inicio.');
    }

    // Verificar si el horario se solapa con otros existentes para el mismo médico
    const verificarSolapamientoSql = `
        SELECT * FROM horarios_libres
        WHERE idMedico = ? 
        AND fechaHora = ?
    `;

    const fechaHora = `${fecha} ${horaInicio}`; // Fecha con hora de inicio combinada

    db.query(verificarSolapamientoSql, [idMedico, fechaHora], (error, resultados) => {
        if (error) {
            console.error('Error al verificar superposición de horarios:', error);
            return res.status(500).send('Error al verificar horarios');
        }

        if (resultados.length > 0) {
            return res.status(400).send('Este horario se solapa con un horario existente para el médico seleccionado.');
        }

        // Insertar el nuevo horario libre en la base de datos
        const agregarHorarioSql = `
            INSERT INTO horarios_libres (idMedico, fechaHora, horaInicio, horaFin, tipoTurno) 
            VALUES (?, ?, ?, ?, ?)
        `;

        db.query(agregarHorarioSql, [idMedico, `${fecha} ${horaInicio}`, horaInicio, horaFin, tipoTurno], (error, results) => {
            if (error) {
                console.error('Error al agregar horario libre:', error);
                return res.status(500).send('Error al agregar horario libre');
            }
            res.redirect(`/admin/medico/${idMedico}/horarios-libres`); // Redirigir a la página de horarios
        });
    });
};



// Función para registrar un usuario con un rol específico
exports.registrarUsuario = (req, res) => {
    const { username, password, role } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);

    const sql = 'INSERT INTO usuarios (username, password, role) VALUES (?, ?, ?)';
    db.query(sql, [username, hashedPassword, role], (error) => {
        if (error) {
            console.error('Error al registrar usuario:', error);
            return res.status(500).send('Error al registrar usuario');
        }
        res.redirect('/admin/dashboard');
    });
};

// Función para asignar una clínica a un médico
exports.asignarClinica = (req, res) => {
    const { idMedico, idClinica } = req.body;

    const sql = 'UPDATE medicos SET idClinica = ? WHERE idMedico = ?';
    db.query(sql, [idClinica, idMedico], (error) => {
        if (error) {
            console.error('Error al asignar clínica:', error);
            return res.status(500).send('Error al asignar clínica');
        }
        res.redirect('/admin/dashboard');
    });
};

// Función para renderizar la vista del administrador
exports.renderAdminDashboard = (req, res) => {
    const sqlEspecialidades = 'SELECT * FROM especialidades';
    const sqlMedicos = `
        SELECT medicos.idMedico, medicos.nombre, medicos.especialidad, medicos.idEspecialidad 
        FROM medicos
    `;
    const sqlClinicas = 'SELECT idClinica, nombre FROM clinicas'; // Nueva consulta para obtener clínicas

    db.query(sqlEspecialidades, (errorEspecialidades, resultadosEspecialidades) => {
        if (errorEspecialidades) {
            console.error('Error al obtener especialidades:', errorEspecialidades);
            return res.status(500).send('Error al obtener especialidades');
        }

        db.query(sqlMedicos, (errorMedicos, resultadosMedicos) => {
            if (errorMedicos) {
                console.error('Error al obtener médicos:', errorMedicos);
                return res.status(500).send('Error al obtener médicos');
            }

            db.query(sqlClinicas, (errorClinicas, resultadosClinicas) => {
                if (errorClinicas) {
                    console.error('Error al obtener clínicas:', errorClinicas);
                    return res.status(500).send('Error al obtener clínicas');
                }

                const medicosPorEspecialidad = {};
                resultadosEspecialidades.forEach(especialidad => {
                    medicosPorEspecialidad[especialidad.id] = resultadosMedicos.filter(
                        medico => medico.idEspecialidad === especialidad.id
                    );
                });

                // Ahora pasamos "clinicas" a la vista
                res.render('escritorioAdministrador', {
                    user: req.session.user,
                    especialidades: resultadosEspecialidades,
                    medicos: resultadosMedicos,
                    clinicas: resultadosClinicas // Pasamos las clínicas a la vista
                });
            });
        });
    });
};



// Función para ver los pacientes pendientes de confirmación
exports.verPacientesPendientes = (req, res) => {
    const sql = 'SELECT * FROM pacientes WHERE estado = "Pendiente"';

    db.query(sql, (error, pacientesPendientes) => {
        if (error) {
            console.error('Error al obtener pacientes pendientes:', error);
            return res.status(500).send('Error al obtener pacientes pendientes');
        }

        res.render('adminPacientesPendientes', { pacientesPendientes });
    });
};
// Función para confirmar un paciente
exports.confirmarPaciente = (req, res) => {
    const { idPaciente } = req.params;
    const sql = 'UPDATE pacientes SET estado = "Confirmado" WHERE idPaciente = ?';

    db.query(sql, [idPaciente], (error) => {
        if (error) {
            console.error('Error al confirmar paciente:', error);
            return res.status(500).send('Error al confirmar paciente');
        }
        res.redirect('/admin/pacientes-pendientes');
    });
};

// Función para rechazar un paciente
exports.rechazarPaciente = (req, res) => {
    const { idPaciente } = req.params;
    const sql = 'UPDATE pacientes SET estado = "Rechazado" WHERE idPaciente = ?';

    db.query(sql, [idPaciente], (error) => {
        if (error) {
            console.error('Error al rechazar paciente:', error);
            return res.status(500).send('Error al rechazar paciente');
        }
        res.redirect('/admin/pacientes-pendientes');
    });
};

exports.verMedicos = (req, res) => {
    const idClinica = req.session.idClinica;

    console.log("ID de la clínica seleccionada:", idClinica); // Verifica el valor de idClinica

    const sql = `
        SELECT m.idMedico, m.nombre, m.especialidad, m.telefono, m.email
        FROM medicos AS m
        JOIN medicos_clinicas AS mc ON m.idMedico = mc.idMedico
        WHERE mc.idClinica = ?
    `;

    db.query(sql, [idClinica], (error, results) => {
        if (error) {
            console.error('Error al obtener los médicos:', error);
            return res.status(500).send('Error al obtener los médicos');
        }

        res.render('medicos', { medicos: results });
    });
};

exports.getDoctors = (req, res) => {
    const { clinicId, specialty } = req.query;

    const sql = `
        SELECT m.idMedico, m.nombre
        FROM medicos AS m
        JOIN medicos_clinicas AS mc ON m.idMedico = mc.idMedico
        JOIN especialidades AS e ON m.especialidad = e.idEspecialidad
        WHERE mc.idClinica = ? AND e.nombre = ?
    `;

    db.query(sql, [clinicId, specialty], (error, results) => {
        if (error) {
            console.error('Error al obtener médicos:', error);
            return res.status(500).json({ error: 'Error al obtener médicos' });
        }
        res.json(results);
    });
};
exports.eliminarHorarioLibre = (req, res) => {
    const { idMedico } = req.body;
    const fecha = req.query.fecha; // '11/11/2024'
    const hora = req.query.hora; // '08:00'

    if (!idMedico || !fecha || !hora) {
        console.error("Faltan datos: idMedico, fecha o hora.");
        return res.status(400).send('Faltan datos para eliminar el horario.');
    }

    // Formateo de fecha y hora en el formato 'YYYY-MM-DD HH:MM:SS'
    const fechaHora = `${fecha.split('/').reverse().join('-')} ${hora}:00`;
    console.log("FechaHora para eliminar:", fechaHora);

    const sqlEliminar = `DELETE FROM horarios_libres WHERE idMedico = ? AND fechaHora = ?`;

    db.query(sqlEliminar, [idMedico, fechaHora], (error, results) => {
        if (error) {
            console.error('Error al eliminar horario libre:', error);
            return res.status(500).send('Error al eliminar horario libre');
        }

        if (results.affectedRows === 0) {
            console.warn("No se encontró el horario para eliminar.");
        } else {
            console.log("Horario eliminado con éxito.");
        }

        res.redirect(`/admin/medico/${idMedico}/horarios-libres`);
    });
};



exports.verHorariosMedico = (req, res) => {
    const { idMedico } = req.query;

    if (!idMedico) {
        return res.status(400).send('El ID del médico es necesario.');
    }

    const medicoSql = `SELECT nombre FROM medicos WHERE idMedico = ?`;
    const horariosSql = `
        SELECT fechaHora, horaInicio, horaFin, estado, tipoTurno
        FROM horarios_libres
        WHERE idMedico = ?
        ORDER BY fechaHora, horaInicio
    `;

    db.query(medicoSql, [idMedico], (error, resultadosMedico) => {
        if (error || resultadosMedico.length === 0) {
            return res.status(500).send('Error al obtener el nombre del médico');
        }

        const nombreMedico = resultadosMedico[0].nombre;

        db.query(horariosSql, [idMedico], (error, horariosLibres) => {
            if (error) {
                return res.status(500).send('Error al obtener los horarios del médico');
            }

            res.render('verHorariosMedico', { horariosLibres, idMedico, nombreMedico });
        });
    });
};


// Ruta para repetir horarios
exports.repetirHorarios = (req, res) => {
    const { idMedico, fechaInicio, fechaFin, accion } = req.body;
  
    // Validación de las fechas
    const startDate = moment(fechaInicio);
    const endDate = moment(fechaFin);
  
    // Verificar si las fechas son válidas
    if (!startDate.isValid() || !endDate.isValid()) {
      return res.status(400).send('Las fechas proporcionadas no son válidas.');
    }
  
    // Llamar a la función para repetir los horarios dependiendo de la acción
    repetirHorarios(idMedico, startDate, endDate, accion)
      .then(() => {
        res.redirect('/admin/dashboard'); // Redirigir después de la repetición
      })
      .catch(error => {
        console.error('Error al repetir horarios:', error);
        res.status(500).send('Error al repetir horarios.');
      });
  };
  