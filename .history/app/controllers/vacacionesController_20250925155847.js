const db = require('../../config/database');
const moment = require('moment');
exports.renderList = (req, res) => {
  const sqlVacaciones = `
    SELECT v.idVacacion, v.idMedico, m.nombre AS medico, v.fechaInicio, v.fechaFin
    FROM vacaciones v
    JOIN medicos m ON v.idMedico = m.idMedico
    ORDER BY v.fechaInicio DESC
  `;

  const sqlMedicos = `SELECT idMedico, nombre FROM medicos`;

  db.query(sqlVacaciones, (errVac, vacaciones) => {
    if (errVac) {
      console.error("Error al cargar vacaciones:", errVac);
      return res.status(500).send("Error al cargar vacaciones");
    }

    db.query(sqlMedicos, (errMed, medicos) => {
      if (errMed) {
        console.error("Error al cargar médicos:", errMed);
        return res.status(500).send("Error al cargar médicos");
      }

      res.render("vacaciones", { vacaciones, medicos });
    });
  });
};


exports.create = (req, res) => {
  let { idMedico, fechaInicio, fechaFin } = req.body;

  // normalizar fechas
  if (fechaInicio) fechaInicio = moment(fechaInicio).format("YYYY-MM-DD");
  if (fechaFin) fechaFin = moment(fechaFin).format("YYYY-MM-DD");

  const sql = `INSERT INTO vacaciones (idMedico, fechaInicio, fechaFin) VALUES (?, ?, ?)`;
  db.query(sql, [idMedico, fechaInicio, fechaFin], (err) => {
    if (err) {
      console.error("Error al registrar vacaciones:", err);
      return res.status(500).send("Error al registrar vacaciones");
    }
    res.redirect("/admin/vacaciones?success=true");
  });
};

exports.remove = (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM vacaciones WHERE idVacacion = ?", [id], (err) => {
    if (err) {
      console.error("Error al eliminar vacaciones:", err);
      return res.status(500).send("Error al eliminar");
    }
    res.redirect("/admin/vacaciones?success=true");
  });
};
