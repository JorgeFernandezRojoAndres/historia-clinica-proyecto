const moment = require('moment'); 
const db = require('../../config/database');

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
exports.verAgenda = async (req, res) => {
    const medicoId = req.params.id;
    try {
        const [citas] = await db.promise().query(
            `SELECT fechaHora AS start, motivoConsulta AS title 
             FROM citas 
             WHERE idMedico = ?`, [medicoId]
        );
        res.render('agenda_medico', { citas });
    } catch (error) {
        console.error('Error al obtener la agenda del médico:', error);
        res.status(500).send('Error al obtener la agenda');
    }
};


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
        const { newPassword, confirmPassword } = req.body;
        const idMedico = req.session.user.id;

        if (newPassword !== confirmPassword) {
            return res.render('CDC', { message: 'Las contraseñas no coinciden' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const sql = 'UPDATE medicos SET password = ?, password_change_required = false WHERE idMedico = ?';

        db.query(sql, [hashedPassword, idMedico], (error) => {
            if (error) {
                console.error('Error al cambiar la contraseña:', error);
                return res.status(500).send('Error al cambiar la contraseña');
            }
            res.redirect('/medico/dashboard');
        });
    } catch (error) {
        console.error('Error en el proceso de cambio de contraseña:', error);
        res.status(500).send('Error interno');
    }
};
