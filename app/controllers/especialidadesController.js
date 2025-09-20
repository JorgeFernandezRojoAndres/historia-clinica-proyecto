const pool = require('../../config/database'); 

// Obtener todas las especialidades y renderizar la vista
const getEspecialidades = (req, res) => {
  pool.query('SELECT * FROM especialidades', (error, results) => {
    if (error) {
      return res.status(500).json({ error: 'Error al obtener las especialidades' });
    }
    // Renderizar la vista newCita.pug con las especialidades
    res.render('newCita', { especialidades: results });
  });
};

module.exports = { getEspecialidades };
