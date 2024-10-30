const moment = require('moment'); 
const db = require('../../config/database');
const citasController = require('./citasController');
const generarHorariosLibres = require('../../utils/horariosLibres');



// Listar todos los médicos, manejando nulos con IFNULL
exports.listAll = (req, res) => {
    const sql = 'SELECT idMedico, nombre, especialidad, telefono, email, dni FROM medicos';

    db.query(sql, (error, results) => {
        if (error) {
            console.error('Error al obtener los médicos:', error);
            res.status(500).send("Error al obtener los médicos");
        } else {
            res.render('medicos', { medicos: results });
        }
    });
};
// Controlador para ver el historial de atenciones de un paciente
exports.verHistorialPaciente = (req, res) => {
    const idPaciente = req.params.idPaciente;

    const sql = `
        SELECT citas.idCita, medicos.nombre AS nombreMedico, citas.fechaHora, citas.motivoConsulta, citas.estado
        FROM citas
        JOIN medicos ON citas.idMedico = medicos.idMedico
        WHERE citas.idPaciente = ?
        ORDER BY citas.fechaHora DESC
    `;

    db.query(sql, [idPaciente], (error, results) => {
        if (error) {
            console.error('Error al obtener el historial del paciente:', error);
            return res.status(500).send('Error al obtener el historial del paciente');
        }

        res.render('historialPaciente', {
            historial: results,
            nombrePaciente: results.length > 0 ? results[0].nombrePaciente : 'Paciente sin historial'
        });
    });
};


// Mostrar formulario para un nuevo médico
exports.showNewForm = (req, res) => {
    res.render('newMedico');  
};

// Crear un nuevo médico
exports.create = (req, res) => {
    const { nombre, especialidad, dni, telefono, email } = req.body;
    const sql = 'INSERT INTO medicos (nombre, especialidad, dni, telefono, email) VALUES (?, ?, ?, ?, ?)';

    db.query(sql, [nombre, especialidad, dni, telefono, email], (error) => {
        if (error) {
            console.error('Error al crear el médico:', error);
            res.status(500).send("Error al crear el médico");
        } else {
            res.redirect('/medicos');
        }
    });
};
exports.obtenerCitasDesdeMedico = (req, res) => {
    citasController.obtenerCitasJSON(req, res);
};

// Mostrar formulario para editar un médico
exports.showEditForm = (req, res) => {
    const sql = 'SELECT * FROM medicos WHERE idMedico = ?';
    db.query(sql, [req.params.id], (error, results) => {
        if (error) {
            console.error('Error al obtener los datos del médico:', error);
            res.status(500).send("Error al obtener los datos del médico");
        } else if (results.length === 0) {
            res.status(404).send('Médico no encontrado');
        } else {
            res.render('editMedico', { medico: results[0] });
        }
    });
};

// Actualizar los datos de un médico
exports.update = (req, res) => {
    const idMedico = req.params.id;
    const { nombre, especialidad, dni, telefono, email } = req.body;
    const sql = 'UPDATE medicos SET nombre = ?, especialidad = ?, dni = ?, telefono = ?, email = ? WHERE idMedico = ?';

    db.query(sql, [nombre, especialidad, dni, telefono, email, idMedico], (error) => {
        if (error) {
            console.error('Error al actualizar el médico:', error);
            res.status(500).send("Error al actualizar el médico");
        } else {
            res.redirect('/medicos');
        }
    });
};
// Eliminar un médico
exports.delete = (req, res) => {
    const idMedico = req.params.id;
    const sql = 'DELETE FROM medicos WHERE idMedico = ?';

    db.query(sql, [idMedico], (error) => {
        if (error) {
            console.error('Error al eliminar el médico:', error);
            res.status(500).send("Error al eliminar el médico");
        } else {
            res.redirect('/medicos');
        }
    });
};

// Ver la agenda del médico con citas actuales
exports.verAgenda = (req, res) => {
    const idMedico = req.params.id;
    const fechaSeleccionada = req.query.fecha || new Date().toISOString().split('T')[0];

    const sql = `
        SELECT citas.idCita, pacientes.nombre AS nombrePaciente, citas.fechaHora, citas.motivoConsulta, citas.estado 
        FROM citas
        JOIN pacientes ON citas.idPaciente = pacientes.idPaciente
        WHERE citas.idMedico = ? AND DATE(citas.fechaHora) = ?
    `;

    db.query(sql, [idMedico, fechaSeleccionada], (error, results) => {
        if (error) {
            console.error('Error al obtener la agenda del médico:', error);
            return res.status(500).send('Error al obtener la agenda del médico');
        }

        // Formatear la fecha y hora antes de enviarla a la vista
        results.forEach(cita => {
            if (cita.fechaHora && moment(cita.fechaHora).isValid()) {
                cita.fechaHora = moment(cita.fechaHora).format('DD/MM/YYYY HH:mm');
            } else {
                cita.fechaHora = 'Sin definir';
            }
        });

        // Generar los horarios libres
        const horariosLibres = generarHorariosLibres(fechaSeleccionada, results);

        // Enviar los horarios libres a la vista
        res.render('agenda_medico', { 
            citas: results, 
            horariosLibres, 
            fechaHoy: fechaSeleccionada,
            medicoId: idMedico
        });
    });
};

exports.verAgendaDelDia = (req, res) => {
    const idMedico = req.params.id;
    const today = new Date().toISOString().split('T')[0];
    const sql = `
        SELECT citas.idCita, pacientes.nombre AS nombrePaciente, citas.fechaHora, citas.motivoConsulta, citas.estado, medicos.nombre AS nombreMedico
        FROM citas
        JOIN pacientes ON citas.idPaciente = pacientes.idPaciente
        JOIN medicos ON citas.idMedico = medicos.idMedico
        WHERE citas.idMedico = ? AND DATE(citas.fechaHora) = ?
    `;

    db.query(sql, [idMedico, today], (error, results) => {
        if (error) {
            console.error('Error al obtener la agenda del día:', error);
            return res.status(500).send('Error al obtener la agenda del día');
        }

        results.forEach(cita => {
            const fecha = new Date(cita.fechaHora);
            cita.fechaHora = `${fecha.getDate()}/${fecha.getMonth() + 1}/${fecha.getFullYear()} ${fecha.getHours().toString().padStart(2, '0')}:${fecha.getMinutes().toString().padStart(2, '0')}`;
        });

        res.render('agenda_medico', {
            citas: results,
            nombreMedico: results.length > 0 ? results[0].nombreMedico : 'Médico sin citas',
            agendaDelDia: true // Agregar esta variable para desactivar el selector de fecha
        });
    });
};



// Función auxiliar para renderizar la agenda
function renderAgenda(res, results, mostrarFiltro) {
    results.forEach(cita => {
        const fecha = new Date(cita.fechaHora);
        cita.fechaHora = `${fecha.getDate()}/${fecha.getMonth() + 1}/${fecha.getFullYear()} 
                          ${fecha.getHours().toString().padStart(2, '0')}:${fecha.getMinutes().toString().padStart(2, '0')}`;
    });

    res.render('agenda_medico', {
        citas: results,
        mostrarFiltro: mostrarFiltro
    });
}


// Buscar médicos por nombre
exports.search = (req, res) => {
    const query = req.query.query?.trim();
    if (!query) {
        return res.status(400).send('Debe ingresar un término de búsqueda');
    }

    const sql = 'SELECT * FROM medicos WHERE nombre LIKE ?';
    const searchTerm = `%${query}%`;

    db.query(sql, [searchTerm], (error, results) => {
        if (error) {
            console.error('Error al buscar médicos:', error);
            return res.status(500).send('Error al buscar médicos');
        }

        res.render('medicos', { medicos: results });
    });
};

// Cambio de contraseña del médico
exports.changePassword = async (req, res) => {
    try {
        console.log("Iniciando proceso de cambio de contraseña");
        const { newPassword, confirmPassword } = req.body;
        console.log("Datos recibidos:", { newPassword, confirmPassword });
        const idMedico = req.session.user.id;
        console.log("ID del médico:", idMedico);

        if (newPassword !== confirmPassword) {
            console.log("Las contraseñas no coinciden");
            return res.render('CDC', { message: 'Las contraseñas no coinciden' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        console.log("Contraseña hasheada:", hashedPassword);
        const sql = 'UPDATE medicos SET password = ?, password_change_required = false WHERE idMedico = ?';

        db.query(sql, [hashedPassword, idMedico], (error) => {
            
            if (error) {
                console.error('Error al cambiar la contraseña:', error);
                return res.status(500).send('Error al cambiar la contraseña');
            }
            console.log("🚀 Contraseña cambiada con éxito para el médico con ID:", idMedico)
            res.redirect('/medico/dashboard');
        });
    } catch (error) {
        console.error('Error en el proceso de cambio de contraseña:', error);
        res.status(500).send('Error interno');
    }
};

// Obtener la lista de pacientes y renderizar la vista del escritorio del médico
exports.verEscritorioMedico = (req, res) => {
    const sql = 'SELECT * FROM pacientes';

    db.query(sql, (error, results) => {
        if (error) {
            console.error('Error al obtener los pacientes:', error);
            return res.status(500).send('Error al obtener los pacientes');
        }

        // Asegúrate de enviar la lista de pacientes a la vista
        res.render('escritorioMedico', {
            user: req.session.user,
            pacientes: results || [] // Enviar un array vacío si no hay resultados
        });
    });
};

// Registrar evolución
exports.registrarEvolucion = (req, res) => {
    // Imprimir todos los datos recibidos para verificar si llegan correctamente
    console.log("Datos recibidos en el controlador:", req.body);

    const { idPaciente, detallesEvolucion } = req.body;

    // Validación para asegurar que los datos requeridos están presentes
    if (!idPaciente || isNaN(idPaciente) || !detallesEvolucion) {
        console.log("Error de validación: Faltan datos requeridos.");
        return res.status(400).send('Faltan datos requeridos para registrar la evolución.');
    }

    const sql = `
        INSERT INTO evoluciones (idPaciente, evolucion, fechaRegistro)
        VALUES (?, ?, NOW())
    `;

    db.query(sql, [idPaciente, detallesEvolucion], (error) => {
        if (error) {
            console.error('Error al registrar la evolución en la base de datos:', error);
            return res.status(500).send('Error al registrar la evolución');
        }

        // Mensaje de éxito en la consola para confirmar el registro exitoso
        console.log("Evolución registrada exitosamente para el paciente ID:", idPaciente);

        // Redirigir al perfil del médico después de guardar la evolución
        res.redirect('/medicos/perfil');
    });
};



// Mostrar el formulario para registrar evolución
exports.mostrarFormularioEvolucion = (req, res) => {
    const idPaciente = req.params.idPaciente || req.query.idPaciente;
    const nombrePaciente = "Nombre del Paciente"; // Deberías obtener esto desde la base de datos según el ID del paciente

    // Verificación de datos antes de renderizar la vista
    if (!idPaciente) {
        console.error("Error: No se proporcionó el ID del paciente.");
        return res.status(400).send("No se proporcionó el ID del paciente.");
    }

    console.log("ID del Paciente al mostrar formulario:", idPaciente);
    console.log("Nombre del Paciente al mostrar formulario:", nombrePaciente);

    // Renderizar la vista con los datos necesarios
    res.render('registrarEvolucion', {
        idPaciente: idPaciente,
        paciente: nombrePaciente
    });
};


// Agregar diagnóstico
exports.agregarDiagnostico = (req, res) => {
    console.log("Datos recibidos para agregar diagnóstico:", req.body);

    const { idPaciente, diagnostico } = req.body;

    if (!idPaciente || !diagnostico) {
        console.error("Faltan datos para agregar el diagnóstico.");
        return res.status(400).send('Faltan datos requeridos para agregar el diagnóstico.');
    }

    const sql = 'INSERT INTO diagnosticos (idPaciente, diagnostico) VALUES (?, ?)';
    db.query(sql, [idPaciente, diagnostico], (error) => {
        if (error) {
            console.error('Error al agregar el diagnóstico:', error);
            return res.status(500).send('Error al agregar el diagnóstico');
        }
        res.redirect('/medicos/escritorio');
    });
};


// Agregar alergias
exports.agregarAlergias = (req, res) => {
    console.log("Datos recibidos para agregar alergia:", req.body);

    const { idPaciente, alergia } = req.body;

    if (!idPaciente || !alergia) {
        console.error("Faltan datos para agregar la alergia.");
        return res.status(400).send('Faltan datos requeridos para agregar la alergia.');
    }

    const sql = 'INSERT INTO alergias (idPaciente, alergia) VALUES (?, ?)';
    db.query(sql, [idPaciente, alergia], (error) => {
        if (error) {
            console.error('Error al agregar la alergia:', error);
            return res.status(500).send('Error al agregar la alergia');
        }
        res.redirect('/medicos/escritorio');
    });
};


exports.registrarAntecedentes = (req, res) => {
    console.log("Datos recibidos para registrar antecedentes:", req.body);

    const { idPaciente, antecedentes } = req.body;

    if (!idPaciente || !antecedentes) {
        console.error("Faltan datos para registrar los antecedentes.");
        return res.status(400).send('Faltan datos requeridos para registrar los antecedentes.');
    }

    const sql = 'INSERT INTO antecedentes (idPaciente, antecedentes) VALUES (?, ?)';
    db.query(sql, [idPaciente, antecedentes], (error) => {
        if (error) {
            console.error('Error al registrar los antecedentes:', error);
            return res.status(500).send('Error al registrar los antecedentes');
        }
        res.redirect('/medicos/escritorio');
    });
};

exports.registrarHabitos = (req, res) => {
    console.log("Datos recibidos para registrar hábitos:", req.body);

    const { idPaciente, habitos } = req.body;

    if (!idPaciente || !habitos) {
        console.error("Faltan datos para registrar los hábitos.");
        return res.status(400).send('Faltan datos requeridos para registrar los hábitos.');
    }

    const sql = 'INSERT INTO habitos (idPaciente, habitos) VALUES (?, ?)';
    db.query(sql, [idPaciente, habitos], (error) => {
        if (error) {
            console.error('Error al registrar los hábitos:', error);
            return res.status(500).send('Error al registrar los hábitos');
        }
        res.redirect('/medicos/escritorio');
    });
};

exports.medicamentos = (req, res) => {
    console.log("Datos recibidos para agregar medicamento:", req.body);

    const { idPaciente, medicamento } = req.body;

    if (!idPaciente || !medicamento) {
        console.error("Faltan datos para agregar el medicamento.");
        return res.status(400).send('Faltan datos requeridos para agregar el medicamento.');
    }

    const sql = 'INSERT INTO medicamentos (idPaciente, medicamento) VALUES (?, ?)';
    db.query(sql, [idPaciente, medicamento], (error) => {
        if (error) {
            console.error('Error al agregar el medicamento:', error);
            return res.status(500).send('Error al agregar el medicamento');
        }
        res.redirect('/medicos/escritorio');
    });
};


// Usar template de nota
exports.templateNota = (req, res) => {
    console.log("Datos recibidos para el template de nota:", req.body);

    const { idPaciente, nota } = req.body;

    if (!idPaciente || !nota) {
        console.error("Faltan datos para el template de nota.");
        return res.status(400).send('Faltan datos requeridos para el template de nota.');
    }

    const sql = 'INSERT INTO notas (idPaciente, nota) VALUES (?, ?)';
    db.query(sql, [idPaciente, nota], (error) => {
        if (error) {
            console.error('Error al usar el template de nota:', error);
            return res.status(500).send('Error al usar el template de nota');
        }
        res.redirect('/medicos/escritorio');
    });
};


