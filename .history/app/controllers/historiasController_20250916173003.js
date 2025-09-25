const db = require('../../config/database');
const PDFDocument = require('pdfkit');


exports.listAll = (req, res) => {
  if (req.session.user.role === 'paciente') {
    // Paciente: solo sus historias
    const idPaciente = req.session.user.id;
    const sqlPaciente = `
      SELECT hc.idHistoria, p.nombre AS nombrePaciente, hc.detalles
      FROM historias_clinicas hc
      JOIN pacientes p ON hc.idPaciente = p.idPaciente
      WHERE hc.idPaciente = ?`;

    db.query(sqlPaciente, [idPaciente], (error, results) => {
      if (error) {
        console.error('Error al obtener historias del paciente:', error);
        return res.status(500).send('Error al obtener historias clínicas');
      }
      res.render('historias', { historias: results });
    });

  } else if (req.session.user.role === 'secretaria') {
    // Secretaria: ve todas las historias
    const sqlSecretaria = `
      SELECT hc.idHistoria, p.nombre AS nombrePaciente, hc.detalles
      FROM historias_clinicas hc
      JOIN pacientes p ON hc.idPaciente = p.idPaciente`;

    db.query(sqlSecretaria, (error, results) => {
      if (error) {
        console.error('Error al obtener todas las historias:', error);
        return res.status(500).send('Error al obtener historias clínicas');
      }
      res.render('historias', { historias: results });
    });

  } else if (req.session.user.role === 'Medico') {
    // Médico: ver historias de los pacientes que tienen citas con él
    const idMedico = req.session.user.id;
    const sqlMedico = `
  SELECT DISTINCT 
    hc.idHistoria, 
    p.nombre AS nombrePaciente, 
    hc.detalles,
    m.nombre AS nombreMedico,
    DATE_FORMAT(c.fechaHora, '%d/%m/%Y %H:%i') AS fechaHora,
    c.motivoConsulta,
    c.estado
  FROM historias_clinicas hc
  JOIN pacientes p ON hc.idPaciente = p.idPaciente
  JOIN citas c ON c.idPaciente = p.idPaciente
  JOIN medicos m ON c.idMedico = m.idMedico
  WHERE c.idMedico = ?`;

    db.query(sqlMedico, [idMedico], (error, results) => {
      if (error) {
        console.error('Error al obtener historias del médico:', error);
        return res.status(500).send('Error al obtener historias clínicas');
      }
      res.render('historialPaciente', { historial: results, nombrePaciente: 'Pacientes atendidos' });
    });

  } else {
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



