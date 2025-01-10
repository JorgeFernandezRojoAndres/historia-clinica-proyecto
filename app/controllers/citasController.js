const db = require('../../config/database');
const { enviarNotificacionAScretaria } = require('../../utils/notificaciones');


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
        SELECT citas.idCita, citas.fechaHora, citas.motivoConsulta, citas.estado, medicos.nombre AS nombreMedico
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

// Crear una nueva cita

// Crear una nueva cita
exports.createCita = (req, res) => {
    const { idPaciente, idMedico, fechaHora, motivoConsulta, tipoTurno } = req.body;

    // Validación de campos
    if (!idPaciente || !idMedico || !fechaHora || !motivoConsulta || !tipoTurno) {
        return res.status(400).send('Faltan datos requeridos para la cita.');
    }

    const sqlCita = `
        INSERT INTO citas (idPaciente, idMedico, fechaHora, motivoConsulta, estado, tipoTurno) 
        VALUES (?, ?, ?, ?, 'En proceso', ?)
    `;

    // Insertar la cita en la base de datos
    db.query(sqlCita, [idPaciente, idMedico, fechaHora, motivoConsulta, tipoTurno], (error) => {
        if (error) {
            console.error('Error al crear la cita:', error);
            return res.status(500).send('Error al crear la cita');
        }

        // Verificar el rol del usuario y redirigir en consecuencia
        if (req.session.user.role === 'paciente') {
            return res.redirect('/turnos/mis-turnos');
        } else if (req.session.user.role === 'secretaria') {
            return res.redirect('/secretaria/citas');
        } else {
            return res.redirect('/'); // Redirigir a la página principal en caso de rol desconocido
        }
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
// Editar una cita
exports.update = (req, res) => {
    const id = req.params.id;
    const { idMedico, idPaciente, fechaHora, motivoConsulta, estado } = req.body;

    // Verificar si la cita está completada
    const sqlVerificar = 'SELECT estado FROM citas WHERE idCita = ?';
    db.query(sqlVerificar, [id], (error, results) => {
        if (error) {
            console.error('Error al verificar el estado de la cita:', error);
            return res.status(500).send('Error al verificar el estado de la cita');
        }

        if (results[0].estado === 'Completado') {
            return res.status(403).send('No se puede editar una cita completada.');
        }

        // Actualizar la cita
        const sql = 'UPDATE citas SET idMedico = ?, idPaciente = ?, fechaHora = ?, motivoConsulta = ?, estado = ? WHERE idCita = ?';
        db.query(sql, [idMedico, idPaciente, fechaHora, motivoConsulta, estado, id], (error) => {
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

// Filtrar citas por estado (solo accesible por la secretaria)
exports.filterByState = (req, res) => {
    const { estado } = req.query; // Obtener el estado seleccionado desde la consulta

    let sql = `
        SELECT citas.idCita, pacientes.nombre AS nombrePaciente, medicos.nombre AS nombreMedico,
               citas.fechaHora, citas.motivoConsulta, citas.estado
        FROM citas
        JOIN pacientes ON citas.idPaciente = pacientes.idPaciente
        JOIN medicos ON citas.idMedico = medicos.idMedico
    `;

    // Aplicar el filtro si se selecciona un estado
    if (estado) {
        sql += ` WHERE citas.estado = ?`;
    }

    const params = estado ? [estado] : [];

    db.query(sql, params, (error, results) => {
        if (error) {
            console.error('Error al filtrar citas por estado:', error);
            return res.status(500).send('Error al filtrar citas');
        }

        // Renderizar la vista con los resultados filtrados
        res.render('citas', {
            citas: results,
            estadoSeleccionado: estado // Para resaltar el filtro seleccionado
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


// Mostrar los turnos del paciente autenticado
exports.listarMisTurnos = (req, res) => {
    const usuario = req.session.user;

    if (!usuario || usuario.role !== 'paciente') {
        return res.status(401).send('Acceso no autorizado');
    }

    const sql = `
        SELECT citas.idCita, citas.fechaHora, citas.motivoConsulta, citas.estado, medicos.nombre AS nombreMedico
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

// Crear una nueva cita

// Crear una nueva cita
exports.createCita = (req, res) => {
    const { idPaciente, idMedico, fechaHora, motivoConsulta, tipoTurno } = req.body;

    // Validación de campos
    if (!idPaciente || !idMedico || !fechaHora || !motivoConsulta || !tipoTurno) {
        return res.status(400).send('Faltan datos requeridos para la cita.');
    }

    const sqlCita = `
        INSERT INTO citas (idPaciente, idMedico, fechaHora, motivoConsulta, estado, tipoTurno) 
        VALUES (?, ?, ?, ?, 'En proceso', ?)
    `;

    // Insertar la cita en la base de datos
    db.query(sqlCita, [idPaciente, idMedico, fechaHora, motivoConsulta, tipoTurno], (error) => {
        if (error) {
            console.error('Error al crear la cita:', error);
            return res.status(500).send('Error al crear la cita');
        }

        // Verificar el rol del usuario y redirigir en consecuencia
        if (req.session.user.role === 'paciente') {
            return res.redirect('/turnos/mis-turnos');
        } else if (req.session.user.role === 'secretaria') {
            return res.redirect('/secretaria/citas');
        } else {
            return res.redirect('/'); // Redirigir a la página principal en caso de rol desconocido
        }
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
// Editar una cita
exports.update = (req, res) => {
    const id = req.params.id;
    const { idMedico, idPaciente, fechaHora, motivoConsulta, estado } = req.body;

    // Verificar si la cita está completada
    const sqlVerificar = 'SELECT estado FROM citas WHERE idCita = ?';
    db.query(sqlVerificar, [id], (error, results) => {
        if (error) {
            console.error('Error al verificar el estado de la cita:', error);
            return res.status(500).send('Error al verificar el estado de la cita');
        }

        if (results[0].estado === 'Completado') {
            return res.status(403).send('No se puede editar una cita completada.');
        }

        // Actualizar la cita
        const sql = 'UPDATE citas SET idMedico = ?, idPaciente = ?, fechaHora = ?, motivoConsulta = ?, estado = ? WHERE idCita = ?';
        db.query(sql, [idMedico, idPaciente, fechaHora, motivoConsulta, estado, id], (error) => {
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

// Filtrar citas por estado (solo accesible por la secretaria)
exports.filterByState = (req, res) => {
    const { estado } = req.query; // Obtener el estado seleccionado desde la consulta

    let sql = `
        SELECT citas.idCita, pacientes.nombre AS nombrePaciente, medicos.nombre AS nombreMedico,
               citas.fechaHora, citas.motivoConsulta, citas.estado
        FROM citas
        JOIN pacientes ON citas.idPaciente = pacientes.idPaciente
        JOIN medicos ON citas.idMedico = medicos.idMedico
    `;

    // Aplicar el filtro si se selecciona un estado
    if (estado) {
        sql += ` WHERE citas.estado = ?`;
    }

    const params = estado ? [estado] : [];

    db.query(sql, params, (error, results) => {
        if (error) {
            console.error('Error al filtrar citas por estado:', error);
            return res.status(500).send('Error al filtrar citas');
        }

        // Renderizar la vista con los resultados filtrados
        res.render('citas', {
            citas: results,
            estadoSeleccionado: estado // Para resaltar el filtro seleccionado
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



  
  

