const moment = require('moment');
const db = require('../config/database'); // Asegúrate de que el path sea correcto


// 🔹 Ahora async
async function generarHorariosLibres(fecha, citas, opciones = {}) {
    const horariosLibres = [];

    // Validar y convertir la fecha al formato estándar
    const fechaBase = moment(fecha, 'YYYY-MM-DD');
    if (!fechaBase.isValid()) {
        console.error(`La fecha proporcionada no es válida: ${fecha}`);
        return horariosLibres; 
    }

    // 🔹 Chequear si es día no laborable
    try {
        const [rows] = await db.promise().query(
            "SELECT 1 FROM dias_no_laborables WHERE fecha = ?",
            [fechaBase.format("YYYY-MM-DD")]
        );
        if (rows.length > 0) {
            console.log("⛔ Día no laborable detectado:", fechaBase.format("YYYY-MM-DD"));
            return []; // Nada de horarios para ese día
        }
    } catch (err) {
        console.error("Error al consultar días no laborables:", err);
        return []; // fallback seguro
    }

    // Horarios de trabajo por defecto
    const inicioMañana = opciones.inicioMañana || 8;
    const finMañana = opciones.finMañana || 12;
    const inicioTarde = opciones.inicioTarde || 14;
    const finTarde = opciones.finTarde || 18;
    const intervalo = opciones.intervalo || 40; 

    // Crear un array con todos los horarios de la mañana
    for (let hora = inicioMañana; hora < finMañana; hora++) {
        for (let minuto = 0; minuto < 60; minuto += intervalo) {
            horariosLibres.push({
                fecha: fechaBase.format('YYYY-MM-DD'),
                hora: `${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}`
            });
        }
    }

    // Crear un array con todos los horarios de la tarde
    for (let hora = inicioTarde; hora < finTarde; hora++) {
        for (let minuto = 0; minuto < 60; minuto += intervalo) {
            horariosLibres.push({
                fecha: fechaBase.format('YYYY-MM-DD'),
                hora: `${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}`
            });
        }
    }

    // Filtrar los horarios que ya están ocupados
    citas.forEach(cita => {
        const horaCita = moment(cita.fechaHora, 'YYYY-MM-DD HH:mm').format('HH:mm');
        const index = horariosLibres.findIndex(h => h.hora === horaCita);
        if (index > -1) horariosLibres.splice(index, 1);
    });

    console.log("Horarios generados:", horariosLibres);
    return horariosLibres;
}

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
