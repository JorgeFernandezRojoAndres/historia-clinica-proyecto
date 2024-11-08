const db = require('../../config/database');
const PDFDocument = require('pdfkit');

// Esta función muestra los historiales clínicos según el rol del usuario:
// - Los pacientes solo pueden ver sus propios historiales clínicos.
// - Las secretarias pueden ver los historiales clínicos de todos los pacientes.
// - Otros roles no tienen acceso a esta información.
exports.listAll = (req, res) => {
  // Verifica el rol del usuario para determinar el acceso a los historiales
  if (req.session.user.role === 'paciente') {
    // El paciente solo puede ver su propio historial clínico
    const idPaciente = req.session.user.id;

    const sqlPaciente = `
      SELECT hc.idHistoria, p.nombre AS nombrePaciente, hc.detalles
      FROM historias_clinicas hc
      JOIN pacientes p ON hc.idPaciente = p.idPaciente
      WHERE hc.idPaciente = ?`;

    db.query(sqlPaciente, [idPaciente], (error, results) => {
      if (error) {
        console.error('Error al obtener las historias clínicas del paciente:', error);
        return res.status(500).send('Error al obtener las historias clínicas');
      }

      // Renderiza solo las historias del paciente
      res.render('historias', { historias: results });
    });

  } else if (req.session.user.role === 'secretaria') {
    // La secretaria puede ver todas las historias clínicas
    const sqlSecretaria = `
      SELECT hc.idHistoria, p.nombre AS nombrePaciente, hc.detalles
      FROM historias_clinicas hc
      JOIN pacientes p ON hc.idPaciente = p.idPaciente`;

    db.query(sqlSecretaria, (error, results) => {
      if (error) {
        console.error('Error al obtener todas las historias clínicas:', error);
        return res.status(500).send('Error al obtener las historias clínicas');
      }

      // Renderiza todas las historias para la secretaria
      res.render('historias', { historias: results });
    });

  } else {
    // Si el rol no es ni paciente ni secretaria, niega el acceso
    res.status(403).send('Acceso no autorizado');
  }
};




exports.showNewForm = (req, res) => {
  res.render('newHistoria');  
};

exports.create = (req, res) => {
  // Lógica para crear una nueva historia clínica
  const { dniPaciente, detalles } = req.body;

  const sqlPaciente = 'SELECT idPaciente FROM pacientes WHERE dni = ?';
  db.query(sqlPaciente, [dniPaciente], (error, results) => {
      if (error) {
          console.error('Error al buscar paciente:', error);
          return res.status(500).send('Error al buscar paciente');
      }

      if (results.length === 0) {
          return res.status(404).send('Paciente no encontrado');
      }

      const idPaciente = results[0].idPaciente;
      const sqlHistoria = 'INSERT INTO historias_clinicas (idPaciente, detalles) VALUES (?, ?)';
      db.query(sqlHistoria, [idPaciente, detalles], (error, result) => {
          if (error) {
              console.error('Error al crear la historia clínica:', error);
              return res.status(500).send('Error al crear la historia clínica');
          }

          res.redirect('/historias_clinicas');
      });
  });
};

exports.update = (req, res) => {
  const id = req.params.id;

  // Verifica si las fechas están vacías y las asigna a NULL si es necesario
  const fechaDiagnostico = req.body.fechaDiagnostico ? req.body.fechaDiagnostico : null;
  const fechaProximaCita = req.body.fechaProximaCita ? req.body.fechaProximaCita : null;

  const {
      idPaciente,
      detalles,
      medicamentos,
      alergias,
      condicionActual,
      pruebasDiagnosticas,
      especialistaReferido,
      urlDocumento,
      notasMedicas
  } = req.body;

  const sql = `
      UPDATE historias_clinicas
      SET idPaciente = ?, detalles = ?, fechaDiagnostico = ?, medicamentos = ?, alergias = ?, condicionActual = ?, 
      pruebasDiagnosticas = ?, fechaProximaCita = ?, especialistaReferido = ?, urlDocumento = ?, notasMedicas = ?
      WHERE idHistoria = ?`;

  db.query(sql, [
      idPaciente, detalles, fechaDiagnostico, medicamentos, alergias, condicionActual,
      pruebasDiagnosticas, fechaProximaCita, especialistaReferido, urlDocumento, notasMedicas, id
  ], (error, results) => {
      if (error) {
          console.error('Error al actualizar la historia clínica:', error);
          res.status(500).send('Error al actualizar la historia clínica');
      } else {
          res.redirect('/historias');
      }
  });
};



exports.delete = (req, res) => {
  const id = req.params.id;
  const sql = 'DELETE FROM historias_clinicas WHERE idHistoria = ?';
  db.query(sql, [id], (error, results) => {
      if (error) {
          console.error('Error al eliminar la historia clínica:', error);
          res.status(500).send('Error al eliminar la historia clínica');
      } else {
          res.redirect('/historias');
      }
  });
};


exports.showEditForm = (req, res) => {
  const id = req.params.id;
  const sql = `
    SELECT hc.*, p.nombre AS nombrePaciente, p.dni AS dniPaciente
    FROM historias_clinicas hc
    JOIN pacientes p ON hc.idPaciente = p.idPaciente
    WHERE hc.idHistoria = ?
  `;
  db.query(sql, [id], (error, results) => {
    if (error) {
      console.error('Error al obtener la historia clínica:', error);
      res.status(500).send('Error al obtener la historia clínica');
    } else {
      if (results.length === 0) {
        res.status(404).send('Historia clínica no encontrada');
      } else {
        res.render('editHistoria', { historia: results[0] });
      }
    }
  });
};


const pdf = require('pdfkit'); // Asegúrate de tener instalado pdfkit para crear PDFs

exports.downloadPDF = (req, res) => {
    const idHistoria = req.params.id;

    // Consulta la historia clínica en la base de datos
    const sql = `
        SELECT hc.idHistoria, p.nombre AS nombrePaciente, hc.detalles
        FROM historias_clinicas hc
        JOIN pacientes p ON hc.idPaciente = p.idPaciente
        WHERE hc.idHistoria = ?`;
        
    db.query(sql, [idHistoria], (error, results) => {
        if (error || results.length === 0) {
            console.error('Error al obtener la historia clínica:', error);
            return res.status(500).send('Error al obtener la historia clínica');
        }

        const historia = results[0];

        // Crear el PDF
        const doc = new pdf();
        res.setHeader('Content-Disposition', `attachment; filename=historia_${idHistoria}.pdf`);
        doc.pipe(res);

        doc.text(`Historia Clínica de ${historia.nombrePaciente}`, { align: 'center' });
        doc.text(`Detalles: ${historia.detalles}`);
        doc.end();
    });
};



