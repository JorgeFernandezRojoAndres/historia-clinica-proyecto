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

// Middleware genérico para verificación de roles
exports.checkRole = (role) => {
    return (req, res, next) => {
        console.log(`Verificando rol de ${role}:`, req.session.user);  // Verifica el rol del usuario
        if (req.session.user && req.session.user.role === role) {
            console.log(`Acceso concedido a ${role}:`, req.session.user);
            return next();
        }
        console.log(`Acceso denegado: Solo para ${role}s`);
        return res.status(403).send(`Acceso denegado: Solo para ${role}s`);
    };
};
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

// Middleware genérico para verificación de roles
exports.checkRole = (role) => {
    return (req, res, next) => {
        console.log(`Verificando rol de ${role}:`, req.session.user);  // Verifica el rol del usuario
        if (req.session.user && req.session.user.role === role) {
            console.log(`Acceso concedido a ${role}:`, req.session.user);
            return next();
        }
        console.log(`Acceso denegado: Solo para ${role}s`);
        return res.status(403).send(`Acceso denegado: Solo para ${role}s`);
    };
};

// Definición específica de los roles usando checkRole
exports.isDoctor = exports.checkRole('doctor');
exports.isSecretaria = exports.checkRole('secretaria');
exports.isPaciente = exports.checkRole('paciente');

// Nuevo middleware para permitir acceso a pacientes y secretarias
exports.isPacienteOrSecretaria = (req, res, next) => {
    console.log('Verificando acceso de paciente o secretaria:', req.session.user);
    if (req.session.user && (req.session.user.role === 'paciente' || req.session.user.role === 'secretaria')) {
        console.log('Acceso concedido a paciente o secretaria:', req.session.user);
        return next();
    }
    console.log('Acceso denegado: Solo para pacientes o secretarias');
    return res.status(403).send('Acceso denegado: Solo para pacientes o secretarias');
};

exports.isSecretaria = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'secretaria') {
        return next();
    }
    return res.status(403).send('Acceso denegado: Solo para secretarias');
};
exports.isSecretaria = exports.checkRole('secretaria');


// Definición específica de los roles usando checkRole
exports.isDoctor = exports.checkRole('doctor');
exports.isSecretaria = exports.checkRole('secretaria');
exports.isPaciente = exports.checkRole('paciente');
