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

    // Crear un array con todos los horarios de la mañana
    for (let hora = inicioMañana; hora < finMañana; hora++) {
        for (let minuto = 0; minuto < 60; minuto += intervalo) {
            const horaFormateada = `${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}`;
            horariosLibres.push(horaFormateada);
        }
    }

    // Crear un array con todos los horarios de la tarde
    for (let hora = inicioTarde; hora < finTarde; hora++) {
        for (let minuto = 0; minuto < 60; minuto += intervalo) {
            const horaFormateada = `${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}`;
            horariosLibres.push(horaFormateada);
        }
    }

    // Filtrar los horarios que ya están ocupados por citas
    citas.forEach(cita => {
        const horaCita = moment(cita.fechaHora).format('HH:mm');
        const index = horariosLibres.indexOf(horaCita);
        if (index > -1) {
            horariosLibres.splice(index, 1); // Eliminar el horario ocupado
        }
    });

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

module.exports = {
    generarHorariosLibres,
    agregarHorarioLibre
};
