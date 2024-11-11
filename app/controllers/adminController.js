const bcrypt = require('bcryptjs'); 
const db = require('../../config/database');
const { agregarHorarioLibre, generarHorariosLibres } = require('../../utils/horariosLibres');
const { repetirHorarios } = require('../../utils/repetirHorarios');

const moment = require('moment');

/// Función para ver los horarios libres de un médico específico
exports.verHorariosLibres = (req, res) => { 
    const { idMedico } = req.params;
    const fecha = moment().format('YYYY-MM-DD');
    const horaActual = moment().format('HH:mm');
    const role = req.user?.role || req.session?.user?.role || 'usuario';

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

        // Consulta para obtener las clínicas disponibles
        const sqlClinicas = 'SELECT idClinica, nombre FROM clinicas';
        db.query(sqlClinicas, (error, clinicas) => {
            if (error) {
                console.error('Error al obtener las clínicas:', error);
                return res.status(500).send('Error al obtener las clínicas');
            }

            // Luego, obtenemos las citas para ese médico en la fecha actual
            const sqlCitas = 'SELECT fechaHora FROM citas WHERE idMedico = ? AND DATE(fechaHora) = ?';
            db.query(sqlCitas, [idMedico, fecha], (error, citas) => {
                if (error) {
                    console.error('Error al obtener citas del médico:', error);
                    return res.status(500).send('Error al obtener citas del médico');
                }

                // Generar horarios iniciales
                let horariosLibres = generarHorariosLibres(fecha, citas); 

                // Filtrar los horarios que ya pasaron respecto a la hora actual
                horariosLibres = horariosLibres.filter(horario => {
                    const horarioFechaHora = moment(`${horario.fecha} ${horario.hora}`, 'DD/MM/YYYY HH:mm');
                    return horarioFechaHora.isAfter(moment());
                });

                // Verificar si el parámetro 'eliminado' está presente en la URL
                if (req.query.fecha && req.query.hora) {
                    const fechaEliminada = req.query.fecha;
                    const horaEliminada = req.query.hora;
                    
                    // Filtrar los horarios eliminados
                    horariosLibres = horariosLibres.filter(horario => 
                        !(horario.fecha === fechaEliminada && horario.hora === horaEliminada)
                    );
                }

                // Renderizar la vista con los datos
                res.render('verHorarios', { 
                    horariosLibres, 
                    idMedico, 
                    nombreMedico, 
                    clinicas, 
                    role // Pasamos el rol del usuario a la vista
                });
            });
        });
    });
};







// Función para agregar horario libre
exports.agregarHorarioLibre = (req, res) => {
    const { idMedico, fecha, horaInicio, horaFin } = req.body;
    const idClinica = req.body.idClinica || req.session.clinicId;

    // Comprobar si idClinica está presente
    if (!idClinica) {
        // Obtén las clínicas y horarios si faltan en `req`
        obtenerClinicasYHorarios(req, idMedico, (error, clinicas, nombreMedico, horariosLibres) => {
            if (error) {
                return res.status(500).render('verHorarios', {
                    errorMessage: "Error al obtener datos de la clínica",
                    idMedico,
                    clinicas: [],
                    nombreMedico: "Nombre del Médico",
                    horariosLibres: []
                });
            }

            // Renderizar vista con mensaje de error por clínica no seleccionada
            res.status(400).render('verHorarios', {
                errorMessage: "La clínica no ha sido seleccionada",
                idMedico,
                clinicas,
                nombreMedico,
                horariosLibres
            });
        });
        return;
    }

    // Consulta para insertar el nuevo horario
    const agregarHorarioSql = `
        INSERT INTO horarios_medicos (idMedico, fecha, horaInicio, horaFin, estado, tipoTurno, idClinica)
        VALUES (?, ?, ?, ?, 'libre', 'laboral', ?)
    `;

    db.query(agregarHorarioSql, [idMedico, fecha, horaInicio, horaFin, idClinica], (error) => {
        if (error) {
            console.error("Error al agregar horario libre:", error);

            // Obtén las clínicas y horarios si ocurre un error al agregar el horario
            obtenerClinicasYHorarios(req, idMedico, (err, clinicas, nombreMedico, horariosLibres) => {
                if (err) {
                    return res.status(500).render('verHorarios', {
                        errorMessage: "Error al obtener datos después de un fallo al agregar el horario",
                        idMedico,
                        clinicas: [],
                        nombreMedico: "Nombre del Médico",
                        horariosLibres: []
                    });
                }

                // Renderizar vista con mensaje de error al agregar el horario
                res.status(500).render('verHorarios', {
                    errorMessage: "Error al agregar horario",
                    idMedico,
                    clinicas,
                    nombreMedico,
                    horariosLibres
                });
            });
            return;
        }

        // Obtener las clínicas y horarios para mostrar mensaje de éxito
        obtenerClinicasYHorarios(req, idMedico, (err, clinicas, nombreMedico, horariosLibres) => {
            if (err) {
                return res.status(500).render('verHorarios', {
                    errorMessage: "Error al obtener datos después de agregar el horario",
                    idMedico,
                    clinicas: [],
                    nombreMedico: "Nombre del Médico",
                    horariosLibres: []
                });
            }

            // Renderizar vista con mensaje de éxito
            res.render('verHorarios', {
                message: "Horario agregado correctamente",
                idMedico,
                clinicas,
                nombreMedico,
                horariosLibres
            });
        });
    });
};

// Función auxiliar para obtener las clínicas y los horarios
function obtenerClinicasYHorarios(req, idMedico, callback) {
    const obtenerClinicasSql = 'SELECT * FROM clinicas';
    const obtenerNombreMedicoSql = 'SELECT nombre FROM medicos WHERE idMedico = ?';
    const obtenerHorariosSql = 'SELECT fecha, horaInicio AS hora FROM horarios_medicos WHERE idMedico = ?';

    db.query(obtenerClinicasSql, (error, clinicas) => {
        if (error) return callback(error);

        db.query(obtenerNombreMedicoSql, [idMedico], (error, resultadosMedico) => {
            if (error) return callback(error);

            const nombreMedico = resultadosMedico.length ? resultadosMedico[0].nombre : "Nombre del Médico";

            db.query(obtenerHorariosSql, [idMedico], (error, horariosLibres) => {
                if (error) return callback(error);

                callback(null, clinicas, nombreMedico, horariosLibres);
            });
        });
    });
}




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
// Función para obtener y pasar especialidades
exports.renderAdminDashboard = (req, res) => {
    const sqlEspecialidades = 'SELECT * FROM especialidades';
    const sqlMedicos = `
        SELECT m.idMedico, m.nombre
        FROM medicos AS m
        JOIN medicos_clinicas AS mc ON m.idMedico = mc.idMedico
        JOIN especialidades AS e ON e.idEspecialidad = m.especialidad
        WHERE mc.idClinica = ? AND e.idEspecialidad = ?
    `;
    const sqlClinicas = 'SELECT idClinica, nombre FROM clinicas';

    db.query(sqlEspecialidades, (errorEspecialidades, resultadosEspecialidades) => {
        if (errorEspecialidades) {
            console.error('Error al obtener especialidades:', errorEspecialidades);
            return res.status(500).send('Error al obtener especialidades');
        }

        db.query(sqlClinicas, (errorClinicas, resultadosClinicas) => {
            if (errorClinicas) {
                console.error('Error al obtener clínicas:', errorClinicas);
                return res.status(500).send('Error al obtener clínicas');
            }

            db.query(sqlMedicos, [req.query.clinicId, req.query.specialtyId], (errorMedicos, resultadosMedicos) => {
                if (errorMedicos) {
                    console.error('Error al obtener médicos:', errorMedicos);
                    return res.status(500).send('Error al obtener médicos');
                }

                // Pasar las especialidades, médicos y clínicas a la vista
                res.render('escritorioAdministrador', {
                    user: req.session.user,
                    especialidades: resultadosEspecialidades,  // Pasar especialidades
                    medicos: resultadosMedicos,
                    clinicas: resultadosClinicas  // Pasar clínicas
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
    const { clinicId, specialtyId } = req.query;

    // Verificar que los parámetros estén presentes
    if (!clinicId || !specialtyId) {
        console.log('Faltan parámetros:', { clinicId, specialtyId });
        return res.status(400).json({ error: "Se requiere clinicId y specialtyId" });
    }

    console.log("Parámetros recibidos:", { clinicId, specialtyId });

    const sqlClinicas = `SELECT idClinica, nombre FROM clinicas`;
    const sqlDoctors = `
    SELECT m.idMedico, m.nombre
    FROM medicos AS m
    JOIN medicos_clinicas AS mc ON m.idMedico = mc.idMedico
    JOIN especialidades AS e ON e.idEspecialidad = m.especialidad
    WHERE mc.idClinica = ? AND e.idEspecialidad = ? 
`;

    // Obtener las clínicas
    db.query(sqlClinicas, (error, clinicas) => {
        if (error) {
            console.error('Error al obtener clínicas:', error);
            return res.status(500).json({ error: 'Error al obtener clínicas' });
        }

        // Obtener los médicos si se reciben las clínicas
        db.query(sqlDoctors, [clinicId, specialtyId], (error, doctors) => {
            if (error) {
                console.error('Error al obtener médicos:', error);
                return res.status(500).json({ error: 'Error al obtener médicos' });
            }

            // Verifica si se encontraron médicos
            if (doctors.length === 0) {
                console.log('No se encontraron médicos para los parámetros proporcionados');
            }

            // Renderizar la vista con clínicas y médicos
            res.render('escritorioAdministrador', {
                doctors: doctors,
                clinicas: clinicas // Pasar las clínicas a la vista
            });
        });
    });
};



exports.eliminarHorarioLibre = (req, res) => {
    const { idMedico } = req.body;
    const fecha = req.query.fecha; // Ejemplo: '11/11/2024'
    const hora = req.query.hora; // Ejemplo: '08:00'

    if (!idMedico || !fecha || !hora) {
        console.error("Faltan datos: idMedico, fecha o hora.");
        return res.status(400).send('Faltan datos para eliminar el horario.');
    }

    // Formateo de fecha en el formato 'YYYY-MM-DD'
    const fechaFormateada = fecha.split('/').reverse().join('-');

    const sql = 'DELETE FROM horarios_medicos WHERE idMedico = ? AND fecha = ? AND horaInicio = ?';

    db.query(sql, [idMedico, fechaFormateada, hora], (error, results) => {
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
        FROM horarios_medicos
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


// Ruta para repetir 
exports.repetirHorarios = (req, res) => {
    const { idMedico, fechaInicio, fechaFin, horaInicio, horaFin, idClinica } = req.body;

    if (!idMedico || !fechaInicio || !fechaFin || !horaInicio || !horaFin || !idClinica) {
        return res.status(400).json({ error: "Faltan datos necesarios para repetir el horario" });
    }

    const startDate = moment(fechaInicio, 'YYYY-MM-DD');
    const endDate = moment(fechaFin, 'YYYY-MM-DD');

    if (!startDate.isValid() || !endDate.isValid() || startDate.isAfter(endDate)) {
        return res.status(400).json({ error: "Fechas no válidas" });
    }

    let current = startDate.clone();

    const verificarYActualizarHorario = (fecha, callback) => {
        const sqlSelect = `
            SELECT * FROM horarios_medicos
            WHERE idMedico = ? AND fecha = ? AND horaInicio = ? AND idClinica = ?
        `;
        
        db.query(sqlSelect, [idMedico, fecha, horaInicio, idClinica], (error, results) => {
            if (error) return callback(error);

            if (results.length > 0) {
                // Si ya existe, actualizamos el horario
                const sqlUpdate = `
                    UPDATE horarios_medicos
                    SET horaFin = ?, estado = 'libre', tipoTurno = 'laboral'
                    WHERE idMedico = ? AND fecha = ? AND horaInicio = ? AND idClinica = ?
                `;
                db.query(sqlUpdate, [horaFin, idMedico, fecha, horaInicio, idClinica], callback);
            } else {
                // Si no existe, lo insertamos
                const sqlInsert = `
                    INSERT INTO horarios_medicos (idMedico, fecha, horaInicio, horaFin, estado, tipoTurno, idClinica)
                    VALUES (?, ?, ?, ?, 'libre', 'laboral', ?)
                `;
                db.query(sqlInsert, [idMedico, fecha, horaInicio, horaFin, idClinica], callback);
            }
        });
    };

    const tareas = [];
    while (current.isSameOrBefore(endDate)) {
        const fecha = current.format('YYYY-MM-DD');
        tareas.push(callback => verificarYActualizarHorario(fecha, callback));
        current.add(1, 'days');
    }

    // Ejecutamos todas las tareas en paralelo
    async.parallel(tareas, (error, results) => {
        if (error) {
            console.error("Error al repetir horarios:", error);
            return res.status(500).json({ error: "Error al repetir horarios" });
        }
        res.status(200).json({ message: "Horarios repetidos correctamente" });
    });
};