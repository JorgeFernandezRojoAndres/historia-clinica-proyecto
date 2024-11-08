// Función para crear un nuevo registro médico
exports.addMedicalRecord = (req, res) => {
    // Primero, obtenemos el ID de la clínica desde la sesión
    const idClinica = req.session.idClinica;

    // Consulta para obtener los médicos asociados a la clínica seleccionada
    const sqlMedicos = `
        SELECT m.*
        FROM medicos AS m
        JOIN medicos_clinicas AS mc ON m.idMedico = mc.idMedico
        WHERE mc.idClinica = ?;
    `;

    db.query(sqlMedicos, [idClinica], (error, medicos) => {
        if (error) {
            console.error('Error al obtener los médicos:', error);
            return res.status(500).send("Error al obtener los médicos");
        }

        // Aquí puedes procesar la lista de médicos o usarla en el formulario si es necesario
        console.log('Lista de médicos:', medicos);

        // Procedemos a crear el registro médico después de obtener los médicos
        const newRecord = {
            pacientesName: req.body.pacientesName,
            condition: req.body.condition,
            treatment: req.body.treatment,
            dateOfVisit: req.body.dateOfVisit || new Date(),
            notes: req.body.notes
        };

        MedicalRecord.create(newRecord, (insertId) => {
            res.status(201).send({ message: "Registro médico creado con éxito", id: insertId });
        });
    });
};
