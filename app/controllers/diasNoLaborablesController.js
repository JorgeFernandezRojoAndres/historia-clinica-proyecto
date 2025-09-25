const db = require('../../config/database');
const moment = require('moment'); // 👈 solo una vez arriba

// 📅 Renderizar vista con listado
exports.renderList = (req, res) => {
  db.query("SELECT * FROM dias_no_laborables ORDER BY fecha", (err, rows) => {
    if (err) {
      console.error("Error al cargar días no laborables:", err);
      return res.status(500).send("Error al cargar días no laborables");
    }
    res.render("diasNoLaborables", { dias: rows });
  });
};

// 📅 Listar (API JSON)
exports.getAll = (req, res) => {
  db.query("SELECT * FROM dias_no_laborables ORDER BY fecha", (err, rows) => {
    if (err) return res.status(500).json({ error: "Error al consultar días" });
    res.json(rows);
  });
};

// 📅 Crear
exports.create = (req, res) => {
  let { fecha, descripcion } = req.body;

  // 🔹 Normalizar la fecha: aceptar DD/MM/YYYY o YYYY-MM-DD y guardar siempre YYYY-MM-DD
  if (fecha) {
    const parsed = moment(fecha, ["DD/MM/YYYY", "YYYY-MM-DD"], true);
    if (parsed.isValid()) {
      fecha = parsed.format("YYYY-MM-DD");
    } else {
      return res.status(400).json({ error: "Formato de fecha inválido" });
    }
  }

  db.query(
    "INSERT INTO dias_no_laborables (fecha, descripcion) VALUES (?, ?)",
    [fecha, descripcion],
    (err) => {
      if (err) {
        console.error("Error al insertar día no laborable:", err);
        return res.status(400).json({ error: "Ya existe esa fecha o datos inválidos" });
      }
      if (req.headers.accept.includes("text/html")) {
        return res.redirect("/admin/dias-no-laborables?success=true");
      }
      res.status(201).json({ message: "Día no laborable agregado" });
    }
  );
};

// 📅 Eliminar
exports.remove = (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM dias_no_laborables WHERE id = ?", [id], (err) => {
    if (err) {
      console.error("Error eliminando día no laborable:", err);
      return res.status(500).json({ error: "Error al eliminar" });
    }
    if (req.headers.accept.includes("text/html")) {
      return res.redirect("/admin/dias-no-laborables?success=true");
    }
    res.json({ message: "Día no laborable eliminado" });
  });
};
