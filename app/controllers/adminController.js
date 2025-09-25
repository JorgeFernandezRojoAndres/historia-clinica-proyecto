const bcrypt = require('bcryptjs'); 
const db = require('../../config/database');

// Función para registrar un usuario con un rol específico
exports.registrarUsuario = (req, res) => {
    const { username, password, role, nombre, dni, telefono, email, idEspecialidad } = req.body;

    if (role === 'secretaria') {
        if (!username || !password) {
            return cargarFormularioConEspecialidades(req, res, 'Usuario y contraseña son requeridos para secretarias');
        }

        const hashedPassword = bcrypt.hashSync(password, 10);
        const sqlUsuario = 'INSERT INTO usuarios (username, password, role) VALUES (?, ?, ?)';
        db.query(sqlUsuario, [username, hashedPassword, role], (error) => {
            if (error) {
                console.error('Error al registrar secretaria:', error);
                return cargarFormularioConEspecialidades(req, res, 'Error al registrar secretaria');
            }
            return res.redirect('/admin/dashboard');
        });

    } else if (role === 'medico') {
        if (!nombre || !dni || !telefono || !email || !idEspecialidad) {
            return cargarFormularioConEspecialidades(req, res, '⚠️ Faltan datos obligatorios para registrar al médico. Complete todos los campos.');
        }

        const sqlMedico = `
            INSERT INTO medicos (nombre, dni, telefono, email, idEspecialidad) 
            VALUES (?, ?, ?, ?, ?)
        `;
        db.query(sqlMedico, [nombre, dni, telefono, email, idEspecialidad], (error) => {
            if (error) {
                console.error('Error al registrar médico:', error);
                return cargarFormularioConEspecialidades(req, res, 'Error al registrar médico');
            }
            return res.redirect('/admin/dashboard');
        });

    } else {
        return cargarFormularioConEspecialidades(req, res, 'Rol no reconocido');
    }
};

exports.renderAdminDashboard = (req, res) => {
    res.render('escritorioAdministrador', { user: req.session.user });
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
        res.redirect('/admin/dashboard');
    });
};

exports.verMedicos = (req, res) => {
    const role = req.session.user?.role;
const isAdmin = role === 'admin' || role === 'administrador';

    let sql, params;

    if (isAdmin) {
        // Admin: ver todos los médicos
        sql = `
            SELECT m.idMedico, m.nombre,
                   COALESCE(e.nombre, 'Sin especialidad') AS especialidad,
                   m.telefono, m.email,
                   COALESCE(m.dni, 'Sin DNI') AS dni
            FROM medicos AS m
            LEFT JOIN especialidades AS e ON m.idEspecialidad = e.idEspecialidad
        `;
        params = [];
    } else {
        // Otros roles: filtrar por clínica
        const idClinica = req.session.idClinica;
        sql = `
            SELECT m.idMedico, m.nombre,
                   COALESCE(e.nombre, 'Sin especialidad') AS especialidad,
                   m.telefono, m.email,
                   COALESCE(m.dni, 'Sin DNI') AS dni
            FROM medicos AS m
            LEFT JOIN especialidades AS e ON m.idEspecialidad = e.idEspecialidad
            JOIN medicos_clinicas AS mc ON m.idMedico = mc.idMedico
            WHERE mc.idClinica IN (?)
        `;
        params = [idClinica];
    }

    db.query(sql, params, (error, results) => {
        if (error) {
            console.error('Error al obtener los médicos:', error);
            return res.status(500).send('Error al obtener los médicos');
        }
        res.render('listadoMedicos', { medicos: results });
    });
};


exports.getDoctors = (req, res) => {
    res.json([]); // Responde con una lista vacía por ahora
};
exports.verPacientesPendientes = (req, res) => {
    res.render('adminPacientesPendientes', { pacientesPendientes: [] }); // Respuesta vacía temporalmente
};

exports.confirmarPaciente = (req, res) => {
    res.send('Paciente confirmado (pendiente de implementación)');
};

exports.rechazarPaciente = (req, res) => {
    res.send('Paciente rechazado (pendiente de implementación)');
};
exports.formularioRegistrarUsuario = (req, res) => {
    const sqlEspecialidades = 'SELECT idEspecialidad, nombre FROM especialidades';

    db.query(sqlEspecialidades, (error, especialidades) => {
        if (error) {
            console.error('Error al obtener especialidades:', error);
            return res.status(500).send('Error al obtener especialidades');
        }

        res.render('formularioRegistrarUsuario', { 
            user: req.session.user,
            especialidades,
            message: null
        });
    });
};

exports.agregarEspecialidad = (req, res) => {
    const { nombre } = req.body;

    if (!nombre) {
        return res.json({ success: false, message: 'El nombre es obligatorio' });
    }

    const sql = 'INSERT INTO especialidades (nombre) VALUES (?)';
    db.query(sql, [nombre], (error, result) => {
        if (error) {
            console.error('Error al agregar especialidad:', error);
            return res.json({ success: false, message: 'Error al guardar especialidad' });
        }

        res.json({ success: true, idEspecialidad: result.insertId });
    });
};
