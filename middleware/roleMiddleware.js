// Verifica si el usuario está autenticado
exports.isAuthenticated = (req, res, next) => {
    console.log('Verificando si está autenticado:', req.session.user);
    if (!req.session.user) {
        console.log('Sesión no encontrada, redirigiendo al login');
        return res.redirect('/login');
    }
    console.log('Autenticación verificada, procediendo...');
    next();
};

// Middleware para permitir acceso a administradores
exports.isAdmin = (req, res, next) => {
    console.log('Verificando acceso de administrador:', req.session.user); // Log para verificar el acceso
    if (req.session.user && req.session.user.role === 'administrador') {
        console.log('Acceso concedido a administrador:', req.session.user);
        return next();
    }
    console.log('Acceso denegado: Solo para administradores');
    return res.status(403).send('Acceso denegado: Solo para administradores');
};



// Middleware genérico para verificación de roles
exports.checkRole = (role) => {
    return (req, res, next) => {
        console.log(`Verificando rol de ${role}:`, req.session.user);
        
        // Log para verificar qué rol se está intentando verificar
        console.log('Rol esperado:', role);

        if (req.session.user) {
            console.log('Usuario autenticado:', req.session.user);
            if (req.session.user.role === role) {
                console.log(`Acceso concedido a ${role}:`, req.session.user);
                return next();
            } else {
                console.log(`Acceso denegado: El rol del usuario es ${req.session.user.role}, se esperaba ${role}`);
            }
        } else {
            console.log('No hay usuario autenticado, redirigiendo...');
        }

        return res.status(403).send(`Acceso denegado: Solo para ${role}s`);
    };
};


// Definición de middleware específicos para cada rol usando checkRole
exports.isMedico = exports.checkRole('Medico');
exports.isSecretaria = exports.checkRole('secretaria');
exports.isPaciente = exports.checkRole('paciente');
exports.isAdministrador = exports.checkRole('administrador'); 
exports.isAdmin = exports.isAdministrador;



// Middleware para permitir acceso a pacientes y médicos
exports.isPacienteOrMedico = (req, res, next) => {
    console.log('Verificando acceso de paciente o médico:', req.session.user);
    if (req.session.user && (req.session.user.role === 'paciente' || req.session.user.role === 'Medico')) {
        console.log('Acceso concedido a paciente o médico:', req.session.user);
        return next();
    }
    console.log('Acceso denegado: Solo para pacientes o médicos');
    return res.status(403).send('Acceso denegado: Solo para pacientes o médicos');
};

// Middleware para permitir acceso a pacientes y secretarias
exports.isPacienteOrSecretaria = (req, res, next) => {
    console.log('Verificando acceso de paciente o secretaria:', req.session.user);
    if (req.session.user && (req.session.user.role === 'paciente' || req.session.user.role === 'secretaria')) {
        console.log('Acceso concedido a paciente o secretaria:', req.session.user);
        return next();
    }
    console.log('Acceso denegado: Solo para pacientes o secretarias');
    return res.status(403).send('Acceso denegado: Solo para pacientes o secretarias');
};
