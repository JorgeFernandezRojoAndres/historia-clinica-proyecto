const db = require('../../config/database');
const moment = require('moment');

exports.renderList = (req, res) => {
  const sqlVac = `
    SELECT v.idVacacion, v.fechaInicio, v.fechaFin, m.nombre AS medico
    FROM vacaciones v
    JOIN medicos m ON v.idMedico = m.idMedico
    ORDER BY v.fechaInicio DESC
  `;

  const sqlMedicos = `SELECT idMedico, nombre FROM medicos ORDER BY nombre`;

  db.query(sqlVac, (errVac, vacaciones) => {
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
  const { idMedico, fechaInicio, fechaFin } = req.body;

  if (!idMedico || !fechaInicio || !fechaFin) {
    return res.status(400).send("Datos incompletos");
  }

  if (moment(fechaFin).isBefore(fechaInicio)) {
    return res.status(400).send("La fecha fin no puede ser menor que inicio");
  }

  // Validar superposición
  const sqlCheck = `
    SELECT 1 FROM vacaciones
    WHERE idMedico = ? 
      AND fechaInicio <= ? 
      AND fechaFin >= ?`;

  db.query(sqlCheck, [idMedico, fechaFin, fechaInicio], (err, rows) => {
    if (err) return res.status(500).send("Error al validar vacaciones");

    if (rows.length > 0) {
      return res.status(400).send("Ya existen vacaciones en este rango");
    }

    db.query(
      "INSERT INTO vacaciones (idMedico, fechaInicio, fechaFin) VALUES (?, ?, ?)",
      [idMedico, fechaInicio, fechaFin],
      (err2) => {
        if (err2) return res.status(500).send("Error al registrar vacaciones");
        res.redirect("/admin/vacaciones?success=true");
      }
    );
  });
};

exports.remove = (req, res) => {
  db.query("DELETE FROM vacaciones WHERE idVacacion = ?", [req.params.id], (err) => {
    if (err) return res.status(500).send("Error al eliminar vacaciones");
    res.redirect("/admin/vacaciones?deleted=true");
  });
};
