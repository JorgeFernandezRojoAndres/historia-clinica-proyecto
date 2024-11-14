function repetirHorarios(idMedico, fechaInicio, fechaFin) {
    const sql = `
        SELECT horaInicio, horaFin, diaSemana
        FROM horarios_estandar_medico
        WHERE idMedico = ?
    `;
    
    // Obtener todos los horarios estándar para el médico
    db.query(sql, [idMedico], (error, horariosEstandar) => {
        if (error) {
            console.error('Error al obtener horarios estándar:', error);
            return;
        }

        const startDate = moment(fechaInicio);  // Fecha de inicio para repetir
        const endDate = moment(fechaFin);  // Fecha de fin para repetir

        // Para cada día en el rango especificado
        while (startDate.isBefore(endDate)) {
            // Verificar si el día de la semana coincide con uno de los horarios estándar
            horariosEstandar.forEach(horario => {
                if (horario.diaSemana === startDate.format('dddd').toLowerCase()) {
                    let horaInicio = moment(horario.horaInicio, 'HH:mm');
                    let horaFin = moment(horario.horaFin, 'HH:mm');
                    let intervalo = 40; // Intervalo de 40 minutos

                    // Crear los horarios para ese día
                    while (horaInicio.isBefore(horaFin)) {
                        const horarioLibre = {
                            fechaHora: horaInicio.format('YYYY-MM-DD HH:mm'),
                            idMedico
                        };

                        // Insertar el horario libre en la base de datos
                        const insertSql = 'INSERT INTO horarios_libres (idMedico, fechaHora) VALUES (?, ?)';
                        db.query(insertSql, [idMedico, horarioLibre.fechaHora], (err) => {
                            if (err) {
                                console.error('Error al agregar horario libre:', err);
                            }
                        });

                        // Avanzar al siguiente intervalo
                        horaInicio.add(intervalo, 'minutes');
                    }
                }
            });

            // Avanzar al siguiente día
            startDate.add(1, 'days');
        }
    });
}
