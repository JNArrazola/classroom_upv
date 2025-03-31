const db = require('../db');

exports.getClasesDelAlumno = (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT c.id, c.nombre, c.codigo_grupo AS grupo, c.cuatrimestre, car.nombre AS carrera
    FROM clase_alumnos ca
    JOIN clases c ON ca.id_clase = c.id
    JOIN carreras car ON c.id_carrera = car.id
    WHERE ca.id_alumno = ?
  `;

  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error('Error al obtener las clases del alumno:', err);
      return res.status(500).json({ mensaje: 'Error interno del servidor' });
    }

    res.json(results);
  });
};
