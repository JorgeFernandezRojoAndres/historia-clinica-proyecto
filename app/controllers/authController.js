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
                res.redirect('/paciente/mi-perfil'); // Asegúrate de que esta ruta exista
            } else {
                res.status(401).send('Paciente no encontrado');
            }
        });
    };



    exports.loginMedico = (req, res) => {
        console.log("Inicio del proceso de login");
        console.log("Datos ingresados:", req.body);
        const { username, password } = req.body;
    
        const sql = 'SELECT * FROM medicos WHERE nombre = ?';
        db.query(sql, [username], (error, results) => {
            if (error || results.length === 0) {
                console.log('Error o credenciales incorrectas');
                return res.status(401).render('loginmedicos', { message: 'Credenciales incorrectas' });
            }
    
            const user = results[0];
            console.log("Usuario encontrado:", user);
            console.log("Contraseña ingresada:", password);
    
            // Verifica si la contraseña ingresada es el DNI
            if (password === user.dni) {
                req.session.user = { id: user.idMedico, role: 'Medico', nombre: user.nombre };
    
                console.log("Sesión guardada:", req.session.user);
    
                if (user.password_change_required) {
                    console.log("Redirigiendo al cambio de contraseña");
                    return res.redirect('/cambiar-contrasena'); // Cambia esta línea si estás usando render
                } else {
                    console.log("Redirigiendo al perfil del médico");
                    return res.redirect('/medicos/perfil');
                }
            } else if (!bcrypt.compareSync(password, user.password)) {
                return res.status(401).render('loginmedicos', { message: 'Credenciales incorrectas' });
            }
    
            req.session.user = { id: user.idMedico, role: 'Medico', nombre: user.nombre };
            console.log("Sesión guardada con hash de contraseña:", req.session.user);
            res.redirect('/medicos/perfil');
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

        // Redirigir según el rol
        if (req.session.user.role === 'administrador') {
            return res.redirect('/admin/dashboard');
        } else if (req.session.user.role === 'secretaria') {
            return res.redirect('/secretaria/pacientes');
        } else {
            return res.status(403).send('Acceso denegado');
        }
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
    
        const sql = 'SELECT * FROM medicos WHERE nombre = ?';
        db.query(sql, [username], (error, results) => {
            if (error || results.length === 0) {
                console.log('Error o credenciales incorrectas');
                return res.status(401).render('loginmedicos', { message: 'Credenciales incorrectas' });
            }
    
            const user = results[0];
            console.log("Usuario encontrado:", user);
            console.log("Contraseña ingresada:", password);
    
            // Verifica si la contraseña ingresada es el DNI
            if (password === user.dni) {
                req.session.user = { id: user.idMedico, role: 'Medico', nombre: user.nombre };
                console.log("Sesión guardada:", req.session.user);
    
                // Verificar si necesita cambiar la contraseña
                if (user.password_change_required) {
                    console.log("Redirigiendo al cambio de contraseña");
                    return res.redirect('/cambiar-contrasena'); // Redirige a la vista de cambio de contraseña
                } else {
                    console.log("Redirigiendo al perfil del médico");
                    return res.redirect('/medicos/perfil'); // Redirige al perfil del médico
                }
            } else if (!bcrypt.compareSync(password, user.password)) {
                return res.status(401).render('loginmedicos', { message: 'Credenciales incorrectas' });
            }
    
            // Si la contraseña es correcta y no es el DNI
            req.session.user = { id: user.idMedico, role: 'Medico', nombre: user.nombre };
            console.log("Sesión guardada con hash de contraseña:", req.session.user);
            res.redirect('/medicos/perfil');
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
    
    
    exports.logout = (req, res) => {
        req.session.destroy();
        res.redirect('/');
    };
