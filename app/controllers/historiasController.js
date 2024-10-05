const db = require('../../config/database');

exports.listAll = (req, res) => {
  const sql = 'SELECT idHistoria, idPaciente, detalles FROM historias_clinicas';
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
  const { idPaciente, detalles } = req.body;
  const sql = 'UPDATE historias_clinicas SET idPaciente = ?, detalles = ? WHERE idHistoria = ?';
  db.query(sql, [idPaciente, detalles, id], (error, results) => {
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
  const sql = 'SELECT * FROM historias_clinicas WHERE idHistoria = ?';
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


