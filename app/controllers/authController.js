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
                res.redirect('/pacientes'); // Asegúrate de que esta ruta exista
            } else {
                res.status(401).send('Paciente no encontrado');
            }
        });
    };



    exports.loginMedico = (req, res) => {
        const { username, password } = req.body;

        // Consulta para buscar el médico por nombre de usuario
        const sql = 'SELECT * FROM medicos WHERE username = ?';
        db.query(sql, [username], (error, results) => {
            if (error || results.length === 0) {
                return res.status(401).render('loginmedicos', { message: 'Credenciales incorrectas' });
            }

            const user = results[0];

            // Verifica si la contraseña ingresada es el DNI
            if (password === user.dni) {
                // Iniciar sesión
                req.session.user = { id: user.idMedico, role: 'medico', nombre: user.nombre };

                // Verificar si necesita cambiar la contraseña
                if (user.password_change_required) {
                    return res.redirect('/cambiar-contrasena'); // Redirige a la página de cambio de contraseña
                }

                // Redirigir al perfil del médico
                return res.redirect('/medicos/perfil'); // Cambia esto para redirigir al perfil
            } else if (!bcrypt.compareSync(password, user.password)) {
                return res.status(401).render('loginmedicos', { message: 'Credenciales incorrectas' });
            }

            // Si la contraseña es correcta y no es el DNI
            req.session.user = { id: user.idMedico, role: 'medico', nombre: user.nombre };
            res.redirect('/medicos/perfil'); // Cambia esto para redirigir al perfil
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


    


        
    exports.login = (req, res) => {
        const { username, password } = req.body;

        // Verificar si el usuario existe en la base de datos
        const sql = 'SELECT * FROM usuarios WHERE username = ?';
        db.query(sql, [username], (error, results) => {
            if (error) {
                console.error('Error al buscar el usuario:', error);
                return res.status(500).send('Error del servidor');
            }

            if (results.length === 0) {
                // Si el usuario no existe
                return res.status(401).render('login', { message: 'Usuario no encontrado' });
            }

            const user = results[0];

            // Verificar la contraseña
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) {
                    console.error('Error al verificar la contraseña:', err);
                    return res.status(500).send('Error del servidor');
                }

                if (!isMatch) {
                    return res.status(401).render('login', { message: 'Contraseña incorrecta' });
                }

                // Si la contraseña es correcta, iniciar sesión
                req.session.user = {
                    id: user.idUsuario,
                    username: user.username,
                    role: user.role
                };

                // Redirigir al área adecuada dependiendo del rol
                if (user.role === 'doctor') {
                    return res.redirect('/doctor/dashboard');
                } else if (user.role === 'secretaria') {
                    return res.redirect('/secretaria/dashboard');
                } else {
                    return res.redirect('/paciente/dashboard');
                }
            });
        });
    };
    exports.cambiarContrasena = (req, res) => {
        const newPassword = req.body.newPassword; // Nueva contraseña proporcionada por el usuario
        const userId = req.session.user.id; // ID del médico que está cambiando la contraseña

        const sql = 'UPDATE medicos SET password = ?, password_change_required = ? WHERE idMedico = ?';
        db.query(sql, [bcrypt.hashSync(newPassword, 10), false, userId], (error, results) => {
            if (error) {
                return res.status(500).send('Error al cambiar la contraseña');
            }
            res.redirect('/medico/dashboard'); // Redirige después de cambiar la contraseña
        });
    };


    exports.logout = (req, res) => {
        req.session.destroy();
        res.redirect('/');
    };
