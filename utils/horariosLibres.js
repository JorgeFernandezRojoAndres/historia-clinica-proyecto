const moment = require('moment');
const db = require('../config/database'); // Asegúrate de que el path sea correcto

function generarHorariosLibres(fecha, citas, opciones = {}) {
    const horariosLibres = [];
    
    // Horarios de trabajo por defecto
    const inicioMañana = opciones.inicioMañana || 8;
    const finMañana = opciones.finMañana || 12;
    const inicioTarde = opciones.inicioTarde || 14;
    const finTarde = opciones.finTarde || 18;
    const intervalo = opciones.intervalo || 40; // Intervalo de 40 minutos por cita

    // Validar y convertir la fecha al formato estándar
    const fechaBase = moment(fecha, 'YYYY-MM-DD');
    if (!fechaBase.isValid()) {
        console.error(`La fecha proporcionada no es válida: ${fecha}`);
        return horariosLibres; // Retornar un array vacío si la fecha es inválida
    }

    // Crear un array con todos los horarios de la mañana
    for (let hora = inicioMañana; hora < finMañana; hora++) {
        for (let minuto = 0; minuto < 60; minuto += intervalo) {
            const horaFormateada = `${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}`;
            horariosLibres.push({
                fecha: fechaBase.format('YYYY-MM-DD'), // Fecha en formato estándar
                hora: horaFormateada,
            });
        }
    }

    // Crear un array con todos los horarios de la tarde
    for (let hora = inicioTarde; hora < finTarde; hora++) {
        for (let minuto = 0; minuto < 60; minuto += intervalo) {
            const horaFormateada = `${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}`;
            horariosLibres.push({
                fecha: fechaBase.format('YYYY-MM-DD'), // Fecha en formato estándar
                hora: horaFormateada,
            });
        }
    }

    // Filtrar los horarios que ya están ocupados por citas
    citas.forEach(cita => {
        const horaCita = moment(cita.fechaHora, 'YYYY-MM-DD HH:mm').format('HH:mm'); // Asegurarse de usar un formato válido
        const index = horariosLibres.findIndex(horario => horario.hora === horaCita);
        if (index > -1) {
            horariosLibres.splice(index, 1); // Eliminar horario ocupado
        }
    });

    console.log("Horarios generados:", horariosLibres);
    return horariosLibres;
}

// Nueva función para agregar horarios libres a la base de datos
function agregarHorarioLibre(idMedico, fechaHora, callback) {
    const sql = 'INSERT INTO horarios_libres (idMedico, fechaHora) VALUES (?, ?)';
    db.query(sql, [idMedico, fechaHora], (error, results) => {
        if (error) {
            console.error('Error al agregar horario libre:', error);
            return callback(error);
        }
        callback(null, results);
    });
}

// Función para eliminar un horario libre
function eliminarHorarioLibre(idMedico, fechaHora, callback) {
    const sql = 'DELETE FROM horarios_libres WHERE idMedico = ? AND fechaHora = ?';
    db.query(sql, [idMedico, fechaHora], (error, results) => {
        if (error) {
            console.error('Error al eliminar horario libre:', error);
            return callback(error);
        }
        if (results.affectedRows === 0) {
            console.log('No se encontró el horario para eliminar.');
            return callback(null, { message: 'No se encontró el horario para eliminar' });
        }
        console.log('Horario eliminado con éxito:', results);
        callback(null, results);
    });
}

module.exports = {
    generarHorariosLibres,
    agregarHorarioLibre,
    eliminarHorarioLibre
};
