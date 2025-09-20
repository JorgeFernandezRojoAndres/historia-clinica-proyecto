const db = require('../../config/database');
const bcrypt = require('bcryptjs');

exports.showLoginForm = (req, res) => {
    res.render('login', { user: req.session.user });  // Mostrará el formulario de login
};

exports.loginPaciente = async (req, res) => {
    console.log(req.body); // Verificar que los datos se reciban correctamente
    const { dni } = req.body;

    // Buscar paciente en la base de datos
    const sql = 'SELECT * FROM pacientes WHERE dni = ?';
    db.query(sql, [dni], (error, results) => {
        if (error) {
            console.error('Error al buscar paciente:', error); // Impresión del error
            return res.status(500).send('Error al buscar paciente');
        }

        console.log('Resultados de la búsqueda:', results); // Mostrar resultados de la búsqueda

        if (results.length > 0) {
            // Iniciar sesión: Establecer una sesión para el paciente
            req.session.user = {
                id: results[0].idPaciente,
                nombre: results[0].nombre,
                role: 'paciente'
            };
            // Redirigir al formulario de selección de clínica
            return res.redirect('/select-clinica'); // Asegúrate de que esta ruta exista en tu archivo de rutas
        } else {
            // Manejar el caso donde el paciente no se encuentra
            return res.status(401).send('Paciente no encontrado');
        }
    });
};


// Función de inicio de sesión para usuarios con el rol de secretaria.


exports.loginSecretaria = (req, res) => {
    const { username, password } = req.body;

    const sql = 'SELECT * FROM usuarios WHERE username = ?';
    db.query(sql, [username], (error, results) => {
        if (error) {
            return res.status(500).render('loginsecretarias', { message: 'Ocurrió un error en el servidor' });
        }

        if (results.length === 0 || !bcrypt.compareSync(password, results[0].password)) {
            return res.status(401).render('loginsecretarias', { message: 'Credenciales incorrectas' });
        }

        // Guarda los datos del usuario en la sesión
        req.session.user = {
            id: results[0].id,
            username: results[0].username,
            role: results[0].role
        };

        // Verificar clínicas asociadas a la secretaria
        const userId = results[0].id; // Asegúrate de que este sea el ID correcto para la consulta
        const sqlClinicas = 'SELECT idClinica FROM medicos_clinicas WHERE idMedico = ?'; // Ajusta según tu modelo

        db.query(sqlClinicas, [userId], (errorClinicas, clinicas) => {
            if (errorClinicas) {
                console.error('Error al obtener clínicas:', errorClinicas);
                return res.status(500).render('loginsecretarias', { message: 'Error al verificar clínicas' });
            }

            if (clinicas.length > 0) {
                req.session.idClinica = clinicas.map(clinica => clinica.idClinica); // Guarda clínicas en la sesión

                // Redirigir según el rol
                if (req.session.user.role === 'administrador') {
                    return res.redirect('/admin/dashboard');
                } else if (req.session.user.role === 'secretaria') {
                    // Aquí verificar si ya hay una clínica seleccionada
                    if (!req.session.idClinica || req.session.idClinica.length === 0) {
                        return res.redirect('/select-clinica'); // Redirigir a la selección de clínica
                    }
                    return res.redirect('/secretaria/pacientes');
                } else {
                    return res.status(403).send('Acceso denegado');
                }
            } else {
                return res.render('loginsecretarias', { message: 'No hay clínicas asociadas a su cuenta' });
            }
        });
    });
};

// Función de inicio de sesión para el administrador
exports.loginAdministrador = (req, res) => {
    const { username, password } = req.body;

    console.log('Intento de inicio de sesión para administrador:', username);

    const sql = 'SELECT * FROM usuarios WHERE username = ? AND role = "administrador"';
    db.query(sql, [username], (error, results) => {
        if (error) {
            console.error('Error en la consulta:', error);
            return res.status(500).render('loginadministrador', { message: 'Ocurrió un error en el servidor' });
        }

        if (results.length === 0) {
            console.log('Administrador no encontrado o credenciales incorrectas');
            return res.status(401).render('loginadministrador', { message: 'Credenciales incorrectas' });
        }

        const user = results[0];
        console.log('Usuario encontrado:', user);

        // Comparar la contraseña ingresada con el hash en la base de datos
        if (!bcrypt.compareSync(password, user.password)) {
            console.log('Contraseña incorrecta para el administrador');
            return res.status(401).render('loginadministrador', { message: 'Credenciales incorrectas' });
        }

        // Si la autenticación es exitosa, guardar los datos en la sesión
        req.session.user = {
            id: user.id,
            username: user.username,
            role: user.role
        };

        console.log('Sesión guardada para el administrador:', req.session.user);

        // Redirigir al panel de administración
        res.redirect('/admin/dashboard');
    });
};


exports.loginMedico = (req, res) => {
    console.log("Inicio del proceso de login");
    console.log("Datos ingresados:", req.body);

    const { username, password } = req.body;
    const sqlMedico = 'SELECT * FROM medicos WHERE nombre = ?';

    db.query(sqlMedico, [username], (error, results) => {
        if (error || results.length === 0) {
            console.error('Error o credenciales incorrectas:', error || "No se encontró el médico.");
            return res.status(401).render('loginmedicos', { message: 'Credenciales incorrectas' });
        }

        const user = results[0];
        console.log("Usuario encontrado:", user);

        // Verifica si el DNI coincide con la contraseña ingresada
        if (password === user.dni) {
            // 🔹 Cambio aquí: role en minúsculas
            req.session.user = { 
                id: user.idMedico, 
                role: 'medico',   // antes decía 'Medico'
                nombre: user.nombre 
            };

            console.log("Sesión guardada:", req.session.user);

            // === Nueva lógica: cargar clínica asociada ===
            const sqlClinicas = 'SELECT idClinica FROM medicos_clinicas WHERE idMedico = ?';
            db.query(sqlClinicas, [user.idMedico], (errorClinicas, clinicas) => {
                if (errorClinicas) {
                    console.error('Error al obtener clínicas del médico:', errorClinicas);
                    return res.status(500).render('loginmedicos', { message: 'Error al verificar clínicas' });
                }

                if (clinicas.length > 0) {
                    // Tomar la primera clínica asociada automáticamente
                    req.session.idClinica = clinicas[0].idClinica;
                    req.session.clinicaSeleccionada = true;

                    console.log(`Clínica automáticamente seleccionada: ${clinicas[0].idClinica}`);
                    return res.redirect('/medicos/perfil');
                } else {
                    return res.render('loginmedicos', { message: 'No hay clínicas asociadas a su cuenta' });
                }
            });
        } else {
            console.error('Contraseña incorrecta');
            return res.status(401).render('loginmedicos', { message: 'Credenciales incorrectas' });
        }
    });
};


exports.cambiarContrasena = (req, res) => {
    const newPassword = req.body.newPassword;
    const userId = req.session.user.id;

    console.log('ID del médico:', userId);

    // Actualiza la contraseña en la tabla usuarios
    const sqlUpdatePassword = 'UPDATE usuarios SET password = ? WHERE id = ?';
    db.query(sqlUpdatePassword, [bcrypt.hashSync(newPassword, 10), userId], (error) => {
        if (error) {
            console.error('Error al cambiar la contraseña:', error);
            return res.status(500).send('Error al cambiar la contraseña');
        }

        // Actualiza el flag de password_change_required en la tabla medicos
        const sqlUpdateMedicos = 'UPDATE medicos SET password_change_required = ? WHERE idMedico = ?';
        db.query(sqlUpdateMedicos, [0, userId], (error) => {
            if (error) {
                return res.status(500).send('Error al actualizar el médico');
            }
            res.redirect('/medico/escritorio'); // Redirige después de cambiar la contraseña
        });
    });
};

exports.seleccionarClinica = (req, res) => {
    console.log('Datos enviados desde el formulario:', req.body);
    console.log('Sesión antes de guardar clínica:', req.session);

    try {
        const { idClinica } = req.body;

        if (!idClinica) {
            console.error('Error: No se recibió idClinica en la solicitud.');
            return res.status(400).send('Debe seleccionar una clínica.');
        }

        req.session.idClinica = idClinica;
        req.session.clinicaSeleccionada = true; // Establecer el flag de clínica seleccionada

        console.log(`Clínica seleccionada: ${idClinica}`);
        console.log('Sesión después de la selección:', req.session);

        // Redirigir según el rol
        if (req.session.user) {
            switch (req.session.user.role) {
                case 'paciente':
                    console.log('Redirigiendo al perfil del paciente...');
                    return res.redirect('/paciente/mi-perfil');
                case 'secretaria':
                    console.log('Redirigiendo a la página de pacientes de la secretaria...');
                    return res.redirect('/secretaria/pacientes');
                case 'administrador':
                    console.log('Redirigiendo al panel del administrador...');
                    return res.redirect('/admin/dashboard');
                default:
                    console.warn('Rol desconocido, redirigiendo al inicio...');
                    return res.redirect('/');
            }
        } else {
            // Si no hay usuario en sesión, redirigir al login
            console.warn('Sesión de usuario no encontrada, redirigiendo al login...');
            return res.redirect('/login');
        }
    } catch (error) {
        console.error('Error en seleccionarClinica:', error);
        return res.status(500).send('Ocurrió un error al procesar la solicitud.');
    }
};








exports.logout = (req, res) => {
    req.session.destroy();
    res.redirect('/');
};
