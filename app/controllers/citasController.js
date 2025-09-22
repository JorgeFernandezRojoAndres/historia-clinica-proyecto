const db = require('../../config/database');
const { enviarNotificacionAScretaria } = require('../../utils/notificaciones');
const { isAuthenticated, isSecretaria, getClinicasPermitidas } = require('../../middleware/roleMiddleware');

// importa el helper

exports.listAll = (req, res) => {
    const { page = 1, limit = 10, estado, fechaInicio, fechaFin, clasificacion } = req.query;
    const offset = (page - 1) * limit;
    const params = [];

    const idClinicas = getClinicasPermitidas(req);

    let sql = `
        SELECT 
            citas.idCita, 
            medicos.nombre AS nombreMedico, 
            pacientes.nombre AS nombrePaciente, 
            citas.fechaHora, 
            citas.motivoConsulta, 
            citas.estado,
            citas.clasificacion
        FROM citas
        JOIN medicos ON citas.idMedico = medicos.idMedico
        JOIN pacientes ON citas.idPaciente = pacientes.idPaciente
        JOIN medicos_clinicas mc ON medicos.idMedico = mc.idMedico
        WHERE 1 = 1
    `;

    // 📌 Aplicar filtro por clínicas
    if (idClinicas.length > 0) {
        sql += ` AND mc.idClinica IN (${idClinicas.map(() => '?').join(',')})`;
        params.push(...idClinicas);
    }

    if (estado) {
        sql += ` AND citas.estado = ?`;
        params.push(estado);
    }

    if (clasificacion) {
        sql += ` AND citas.clasificacion = ?`;
        params.push(clasificacion);
    }

    if (fechaInicio && fechaFin) {
        sql += ` AND citas.fechaHora BETWEEN ? AND ?`;
        params.push(fechaInicio, fechaFin);
    }

    sql += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    db.query(sql, params, (error, results) => {
        if (error) {
            console.error('Error al obtener las citas:', error);
            return res.status(500).send("Error al obtener las citas");
        }

        db.query('SELECT COUNT(*) AS total FROM citas', (countError, countResults) => {
            if (countError) {
                console.error('Error al contar las citas:', countError);
                return res.status(500).send("Error al contar las citas");
            }

            const total = countResults[0].total;
            const totalPages = Math.ceil(total / limit);

            res.render('citas', {
                citas: results,
                total,
                totalPages,
                currentPage: parseInt(page)
            });
        });
    });
};

// Filtrar citas por estado y clasificación (solo accesible por la secretaria)
exports.filterByState = (req, res) => {
    console.log("👉 Entró a filterByState con query:", req.query);
    const { estado, clasificacion, clinica } = req.query;

    // 🔹 Obtener clínicas y normalizar siempre a array
    let rawClinicas = getClinicasPermitidas(req);
    const idClinicas = Array.isArray(rawClinicas) ? rawClinicas : [rawClinicas];

    console.log("Clinicas permitidas en sesión (normalizadas):", idClinicas);

    let sql = `
        SELECT citas.idCita, 
               pacientes.nombre AS nombrePaciente, 
               medicos.nombre AS nombreMedico,
               citas.fechaHora, 
               citas.motivoConsulta, 
               citas.estado,
               citas.clasificacion
        FROM citas
        JOIN pacientes ON citas.idPaciente = pacientes.idPaciente
        JOIN medicos ON citas.idMedico = medicos.idMedico
        JOIN medicos_clinicas mc ON medicos.idMedico = mc.idMedico
        WHERE 1 = 1
    `;

    const params = [];

    // 📌 Filtro por clínica
    if (req.session.user && req.session.user.role === 'secretaria') {
        if (clinica) {
            sql += ` AND mc.idClinica = ?`;
            params.push(clinica);
            console.log("Secretaria → filtrando por clínica específica:", clinica);
        } else {
            console.log("Secretaria → sin filtro de clínica (ve todas)");
        }
    } else if (idClinicas.length > 0) {
        sql += ` AND mc.idClinica IN (${idClinicas.map(() => '?').join(',')})`;
        params.push(...idClinicas);
    }

    // 📌 Filtro por estado
    if (estado) {
        sql += ` AND citas.estado = ?`;
        params.push(estado);
    }

    // 📌 Filtro por clasificación
    if (clasificacion) {
        sql += ` AND citas.clasificacion = ?`;
        params.push(clasificacion);
    }

    db.query(sql, params, (error, results) => {
        if (error) {
            console.error('Error al filtrar citas:', error);
            return res.status(500).send('Error al filtrar citas');
        }

        // 🔹 Formatear la fecha en español
        const citasFormateadas = results.map(cita => ({
            ...cita,
            fechaHora: new Date(cita.fechaHora).toLocaleString("es-AR", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit"
            })
        }));

        // 🔹 Ver si hay alguna pendiente
        const hayPendientes = citasFormateadas.some(c => c.estado === 'Pendiente');

        console.log("👉 Estado seleccionado en render:", estado);
        console.log("👉 ¿Hay pendientes?", hayPendientes);

        res.render('citas', {
            citas: citasFormateadas,
            estadoSeleccionado: estado || '',
            clasificacionSeleccionada: clasificacion || '',
            clinicaSeleccionada: clinica || '',
            hayPendientes // 👈 ahora lo pasamos a la vista
        });
    });
};


// Mostrar formulario para una nueva cita
exports.showNewForm = async (req, res) => {
    const usuario = req.session.user;

    if (!usuario) {
        return res.status(401).send('Usuario no autenticado');
    }

    try {
        // Consultas SQL para obtener especialidades y médicos con sus especialidades
        const [especialidades, medicos] = await Promise.all([
            new Promise((resolve, reject) => {
                db.query('SELECT * FROM especialidades', (err, results) => {
                    if (err) {
                        console.error('Error al obtener las especialidades:', err);
                        return reject(err);
                    }
                    resolve(results);
                });
            }),
            new Promise((resolve, reject) => {
                const sqlMedicos = `
                    SELECT 
                        medicos.idMedico, 
                        medicos.nombre, 
                        especialidades.nombre AS especialidad, 
                        medicos.telefono, 
                        medicos.email 
                    FROM medicos
                    LEFT JOIN especialidades ON medicos.idEspecialidad = especialidades.idEspecialidad
                `;
                db.query(sqlMedicos, (err, results) => {
                    if (err) {
                        console.error('Error al obtener los médicos:', err);
                        return reject(err);
                    }
                    resolve(results);
                });
            })
        ]);

        console.log('Especialidades obtenidas:', especialidades);
        console.log('Médicos obtenidos:', medicos);

        // Configuración de datos para la vista
        const renderData = {
            especialidades,
            medicos,
            nombrePaciente: null,
            idPaciente: null
        };

        if (usuario.role === 'paciente') {
            renderData.nombrePaciente = usuario.nombre;
            renderData.idPaciente = usuario.id;
        }

        res.render('newCita', renderData);

    } catch (error) {
        console.error('Error al cargar el formulario de nueva cita:', error);
        res.status(500).send('Error al cargar el formulario de nueva cita');
    }
};

// Mostrar los turnos del paciente autenticado
exports.listarMisTurnos = (req, res) => {
    const usuario = req.session.user;

    if (!usuario || usuario.role !== 'paciente') {
        return res.status(401).send('Acceso no autorizado');
    }

    const sql = `
        SELECT 
            citas.idCita, 
            citas.fechaHora, 
            citas.motivoConsulta, 
            citas.estado, 
            medicos.nombre AS nombreMedico
        FROM citas
        JOIN medicos ON citas.idMedico = medicos.idMedico
        WHERE citas.idPaciente = ?
        ORDER BY citas.fechaHora DESC
    `;

    db.query(sql, [usuario.id], (error, results) => {
        if (error) {
            console.error('Error al obtener los turnos:', error);
            return res.status(500).send('Error al obtener los turnos');
        }

        res.render('misTurnos', { turnos: results });
    });
};
// Actualizar una cita
exports.update = (req, res) => {
    const id = req.params.id;
    const { idMedico, idPaciente, fechaHora, motivoConsulta, estado, clasificacion } = req.body;

    // Verificar si la cita existe y si está completada
    const sqlVerificar = 'SELECT estado FROM citas WHERE idCita = ?';
    db.query(sqlVerificar, [id], (error, results) => {
        if (error) {
            console.error('Error al verificar el estado de la cita:', error);
            return res.status(500).send('Error al verificar el estado de la cita');
        }

        // ✅ Validar si no existe la cita
        if (results.length === 0) {
            return res.status(404).send('Cita no encontrada.');
        }

        // ✅ Validar si ya está completada
        if (results[0].estado === 'Completado') {
            return res.status(403).send('No se puede editar una cita completada.');
        }

        // Actualizar la cita incluyendo clasificación
        const sql = `
            UPDATE citas 
            SET idMedico = ?, idPaciente = ?, fechaHora = ?, motivoConsulta = ?, estado = ?, clasificacion = ?
            WHERE idCita = ?
        `;

        db.query(sql, [idMedico, idPaciente, fechaHora, motivoConsulta, estado, clasificacion, id], (error) => {
            if (error) {
                console.error('Error al actualizar la cita:', error);
                return res.status(500).send('Error al actualizar la cita');
            }
            res.redirect('/citas');
        });
    });
};

// Eliminar una cita
exports.delete = (req, res) => {
    const id = req.params.id;

    // Verificar si la cita está completada
    const sqlVerificar = 'SELECT estado FROM citas WHERE idCita = ?';
    db.query(sqlVerificar, [id], (error, results) => {
        if (error) {
            console.error('Error al verificar el estado de la cita:', error);
            return res.status(500).send('Error al verificar el estado de la cita');
        }

        if (results[0].estado === 'Completado') {
            return res.status(403).send('No se puede eliminar una cita completada.');
        }

        // Eliminar la cita
        const sql = 'DELETE FROM citas WHERE idCita = ?';
        db.query(sql, [id], (error) => {
            if (error) {
                console.error('Error al eliminar la cita:', error);
                return res.status(500).send('Error al eliminar la cita');
            }
            res.redirect('/citas');
        });
    });
};

// Crear una nueva cita
exports.createCita = (req, res) => {
    const { idPaciente, idMedico, fechaHora, motivoConsulta, tipoTurno } = req.body;

    if (!idPaciente || !idMedico || !fechaHora || !motivoConsulta || !tipoTurno) {
        return res.status(400).send('Faltan datos requeridos para la cita.');
    }

    const sanitizedIdPaciente = parseInt(idPaciente, 10);
    const sanitizedIdMedico = parseInt(idMedico, 10);
    const sanitizedMotivoConsulta = motivoConsulta.trim();
    const sanitizedTipoTurno = tipoTurno.trim();

    if (isNaN(sanitizedIdPaciente) || isNaN(sanitizedIdMedico)) {
        return res.status(400).send('ID de paciente o médico inválido.');
    }

    // 📌 Estado depende del rol
    let estadoInicial = 'En proceso';  // default
    if (req.session.user) {
        if (req.session.user.role === 'paciente') {
            estadoInicial = 'Pendiente';   // turno online
        } else if (req.session.user.role === 'secretaria') {
            estadoInicial = 'Confirmado';  // secretaria lo carga y queda confirmado
        }
    }

    const sqlCita = `
        INSERT INTO citas (idPaciente, idMedico, fechaHora, motivoConsulta, estado, tipoTurno) 
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sqlCita,
        [sanitizedIdPaciente, sanitizedIdMedico, fechaHora, sanitizedMotivoConsulta, estadoInicial, sanitizedTipoTurno],
        (error) => {
            if (error) {
                console.error('Error al crear la cita:', error);
                return res.status(500).send('Error al crear la cita.');
            }

            if (req.session.user.role === 'paciente') {
                return res.redirect('/turnos/mis-turnos');
            } else if (req.session.user.role === 'secretaria') {
                return res.redirect('/secretaria/citas');
            } else {
                return res.redirect('/');
            }
        }
    );
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
        if (resultsCita.length === 0) {
            return res.status(404).send("Cita no encontrada");
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
    const { fechaInicio, fechaFin, estado } = req.query; // Parámetros opcionales

    console.log('ID del médico:', medicoId);

    let sql = `
        SELECT fechaHora, motivoConsulta, estado
        FROM citas
        WHERE idMedico = ?
    `;
    const params = [medicoId];

    // Filtrar por rango de fechas
    if (fechaInicio && fechaFin) {
        sql += ' AND fechaHora BETWEEN ? AND ?';
        params.push(fechaInicio, fechaFin);
    }

    // Filtrar por estado
    if (estado) {
        sql += ' AND estado = ?';
        params.push(estado);
    }

    db.query(sql, params, (error, results) => {
        if (error) {
            console.error('Error al obtener las citas:', error);
            return res.status(500).send('Error al obtener las citas');
        }

        const citasFormateadas = results.map(cita => ({
            fecha: new Date(cita.fechaHora).toLocaleString("es-AR", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit"
            }),

            motivo: cita.motivoConsulta || 'No especificado',
            estado: cita.estado,
        }));

        console.log('Citas formateadas:', citasFormateadas);
        res.json(citasFormateadas);
    });
};
exports.actualizarEstadoCita = (req, res) => {
    const { idCita, nuevoEstado } = req.body;

    // Validación de datos
    if (!idCita || !nuevoEstado) {
        return res.status(400).send('Faltan datos requeridos.');
    }

    const sql = 'UPDATE citas SET estado = ? WHERE idCita = ?';

    db.query(sql, [nuevoEstado, idCita], (error, results) => {
        if (error) {
            console.error('Error al actualizar el estado de la cita:', error);
            return res.status(500).send('Error al actualizar el estado.');
        }

        console.log(`Estado de la cita ${idCita} actualizado a ${nuevoEstado}`);
        res.json({ mensaje: 'Estado actualizado correctamente' });
    });
};
exports.iniciarConsulta = (req, res) => {
    const idCita = req.params.idCita;

    // Actualizar el estado de la cita a "Atendido"
    const sql = 'UPDATE citas SET estado = ? WHERE idCita = ?';

    db.query(sql, ['Atendido', idCita], (error) => {
        if (error) {
            console.error('Error al iniciar la consulta:', error);
            return res.status(500).send('Error al iniciar la consulta');
        }

        // Redirigir a la historia clínica del paciente
        res.redirect(`/historia-clinica/${idCita}`);
    });
};
exports.cargarConsulta = (req, res) => {
    const idCita = req.params.idCita;

    // Consulta para obtener la información de la cita y el paciente
    const sql = `
        SELECT citas.idCita, pacientes.nombre AS nombrePaciente, citas.fechaHora, citas.motivoConsulta
        FROM citas
        JOIN pacientes ON citas.idPaciente = pacientes.idPaciente
        WHERE citas.idCita = ?
    `;

    db.query(sql, [idCita], (error, results) => {
        if (error) {
            console.error('Error al cargar la consulta:', error);
            return res.status(500).send('Error al cargar la consulta');
        }

        if (results.length === 0) {
            return res.status(404).send('Cita no encontrada');
        }

        // Renderizar la vista de consulta
        res.render('consulta', {
            cita: results[0]
        });
    });
};
// Marcar automáticamente citas pasadas como "Completado"
exports.marcarCitasCompletadas = () => {
    const sql = `
        UPDATE citas
        SET estado = 'Completado'
        WHERE fechaHora < NOW() AND estado != 'Completado'
    `;

    db.query(sql, (error) => {
        if (error) {
            console.error('Error al marcar citas como completadas:', error);
        } else {
            console.log('Citas pasadas marcadas como "Completado".');
        }
    });
};
// Eliminar un turno completado
exports.deleteCompleted = (req, res) => {
    const id = req.params.id;
    const sql = 'DELETE FROM citas WHERE idCita = ? AND estado = "Completado"';

    db.query(sql, [id], (error, results) => {
        if (error) {
            console.error('Error al eliminar el turno completado:', error);
            res.status(500).send("Error al eliminar el turno completado");
        } else {
            res.redirect('/turnos/mis-turnos');
        }
    });
};
exports.countEnProceso = (req, res) => {
    const sql = "SELECT COUNT(*) AS count FROM citas WHERE estado = 'En proceso'";
    db.query(sql, (error, results) => {
        if (error) {
            console.error('Error al contar citas en proceso:', error);
            return res.status(500).send('Error al contar citas en proceso');
        }
        res.json({ count: results[0].count });
    });
};
// funcion para la bsuqueda de paciente
exports.autocompletePacientesParaCita = (req, res) => {
    const term = req.query.term;
    const sql = `SELECT idPaciente, nombre FROM pacientes WHERE nombre LIKE ? LIMIT 10`;
    db.query(sql, [`%${term}%`], (error, results) => {
        if (error) {
            console.error('Error en la búsqueda de pacientes:', error);
            return res.status(500).send('Error en la búsqueda');
        }
        res.json(results);
    });
};

exports.confirmarPendientes = (req, res) => {
    const { clinica, idCita } = req.body;

    let sql;
    const params = [];

    if (idCita) {
        sql = "UPDATE citas SET estado = 'Confirmado' WHERE idCita = ? AND estado = 'Pendiente'";
        params.push(idCita);
    } else {
        sql = "UPDATE citas SET estado = 'Confirmado' WHERE estado = 'Pendiente'";
        if (clinica) {
            sql += " AND idCita IN (SELECT c.idCita FROM citas c JOIN medicos_clinicas mc ON c.idMedico = mc.idMedico WHERE mc.idClinica = ?)";
            params.push(clinica);
        }
    }

    db.query(sql, params, (error, result) => {
        if (error) {
            console.error("Error al confirmar citas pendientes:", error);
            return res.status(500).json({ error: "Error al confirmar pendientes" });
        }

        console.log(`👉 ${result.affectedRows} citas confirmadas.`);

        // 🔹 Siempre devolver JSON, tanto para una como para múltiples
        return res.json({
            mensaje: idCita
                ? `Cita ${idCita} confirmada correctamente`
                : `${result.affectedRows} citas confirmadas correctamente`,
            idCita: idCita || null,
            clinica: clinica || null,
            totalConfirmadas: result.affectedRows
        });
    });
};






