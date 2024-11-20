const bcrypt = require('bcryptjs'); 
const db = require('../../config/database');
const { agregarHorarioLibre, generarHorariosLibres } = require('../../utils/horariosLibres');
const moment = require('moment');

// Función para ver los horarios libres de un médico específico
exports.verHorariosLibres = (req, res) => {
    const { idMedico } = req.params;
    const fecha = moment().format('YYYY-MM-DD'); // Fecha actual

    const sql = 'SELECT fechaHora FROM citas WHERE idMedico = ? AND DATE(fechaHora) = ?';
    db.query(sql, [idMedico, fecha], (error, citas) => {
        if (error) {
            console.error('Error al obtener citas del médico:', error);
            return res.status(500).send('Error al obtener citas del médico');
        }

        const horariosLibres = generarHorariosLibres(fecha, citas);
        res.render('verHorarios', { horariosLibres, medicoId: idMedico });
    });
};

// Función para agregar un horario libre para un médico, verificando superposición de horarios
exports.agregarHorarioLibre = (req, res) => {
    const { idMedico, fechaHora } = req.body;
    const fecha = moment(fechaHora).format('YYYY-MM-DD');
    const horaInicio = moment(fechaHora).format('HH:mm');
    const horaFin = moment(fechaHora).add(40, 'minutes').format('HH:mm');
    const tipoTurno = 'libre';

    const verificarSolapamientoSql = `
        SELECT * FROM horarios 
        WHERE idMedico = ? 
        AND fecha = ? 
        AND (
            (horaInicio <= ? AND horaFin > ?) OR 
            (horaInicio < ? AND horaFin >= ?)
        )
    `;
    
    db.query(verificarSolapamientoSql, [idMedico, fecha, horaInicio, horaInicio, horaFin, horaFin], (error, resultados) => {
        if (error) {
            console.error('Error al verificar superposición de horarios:', error);
            return res.status(500).send('Error al verificar horarios');
        }

        if (resultados.length > 0) {
            return res.status(400).send('Este horario se solapa con un horario existente para el médico seleccionado.');
        }

        const agregarHorarioSql = `
            INSERT INTO horarios (idMedico, fecha, horaInicio, horaFin, tipoTurno) 
            VALUES (?, ?, ?, ?, ?)
        `;
        
        db.query(agregarHorarioSql, [idMedico, fecha, horaInicio, horaFin, tipoTurno], (error, results) => {
            if (error) {
                console.error('Error al agregar horario libre:', error);
                return res.status(500).send('Error al agregar horario libre');
            }
            res.redirect('/admin/dashboard');
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
exports.formularioAsignarClinica = (req, res) => {
    const sqlMedicos = 'SELECT idMedico, nombre FROM medicos';
    const sqlClinicas = 'SELECT idClinica, nombre FROM clinicas';

    db.query(sqlMedicos, (errMedicos, medicos) => {
        if (errMedicos) {
            console.error('Error al obtener médicos:', errMedicos);
            return res.status(500).send('Error al obtener médicos.');
        }

        db.query(sqlClinicas, (errClinicas, clinicas) => {
            if (errClinicas) {
                console.error('Error al obtener clínicas:', errClinicas);
                return res.status(500).send('Error al obtener clínicas.');
            }

            res.render('formularioAsignarClinica', { medicos, clinicas });
        });
    });
};

// Función para asignar una clínica a un médico
exports.asignarClinica = (req, res) => {
    const { idMedico, idClinica } = req.body;

    if (!idMedico || !idClinica) {
        console.error('Faltan parámetros: idMedico o idClinica');
        return res.status(400).send('Debe proporcionar el ID del médico y el ID de la clínica.');
    }

    // Inserción en la tabla medicos_clinicas
    const sql = `
        INSERT INTO medicos_clinicas (idMedico, idClinica)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE idMedico = VALUES(idMedico), idClinica = VALUES(idClinica)
    `;

    db.query(sql, [idMedico, idClinica], (error) => {
        if (error) {
            console.error('Error al asignar clínica:', error);
            return res.status(500).send('Error al asignar clínica al médico.');
        }

        console.log(`Clínica con ID ${idClinica} asignada correctamente al médico con ID ${idMedico}.`);
        res.redirect('/admin/dashboard'); // Redirigir al panel del administrador
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
