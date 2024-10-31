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
    
    
    





    exports.loginSecretaria = (req, res) => {
        const { username, password } = req.body;

        console.log('Contraseña ingresada:', password); // Verificar que la contraseña se reciba

        const sql = 'SELECT * FROM usuarios WHERE username = ?';
        db.query(sql, [username], (error, results) => {
            if (error || results.length === 0) {
                console.log('Usuario no encontrado o error:', error);
                return res.status(401).render('loginsecretarias', { message: 'Credenciales incorrectas' });
            }

            console.log('Resultados:', results); // Mostrar resultados de la consulta

            // Comparar la contraseña ingresada con el hash en la base de datos
            if (!bcrypt.compareSync(password, results[0].password)) {
                console.log('Contraseña incorrecta');
                return res.status(401).render('loginsecretarias', { message: 'Credenciales incorrectas' });
            }

            // Si todo es correcto, guardar más datos en la sesión
            req.session.user = {
                id: results[0].id,  // Accede correctamente al ID
                username: results[0].username,
                role: results[0].role
            };
            
            console.log('Sesión después del login:', req.session.user);  // Verificar sesión
            

            console.log('Redirigiendo a /secretaria/pacientes'); 
    res.redirect('/secretaria/pacientes');

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
