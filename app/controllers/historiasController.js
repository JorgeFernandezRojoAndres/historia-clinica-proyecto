const db = require('../../config/database');

exports.listAll = (req, res) => {
  const sql = `
    SELECT hc.idHistoria, p.nombre AS nombrePaciente, hc.detalles
    FROM historias_clinicas hc
    JOIN pacientes p ON hc.idPaciente = p.idPaciente
  `;
  db.query(sql, (error, results) => {
    if (error) {
      console.error('Error al obtener las historias clínicas:', error);
      res.status(500).send('Error al obtener las historias clínicas');
    } else {
      res.render('historias', { historias: results });
    }
  });
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




