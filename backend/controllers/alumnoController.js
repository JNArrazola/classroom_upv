const db = require('../db');

// Obtener las clases en las que el alumno está inscrito
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

// Obtener las tareas próximas a entregar que aún no han sido entregadas por el alumno
exports.obtenerTareasProximas = (req, res) => {
  const idAlumno = parseInt(req.params.id);

  if (isNaN(idAlumno)) {
    return res.status(400).json({ mensaje: 'ID de alumno inválido' });
  }

  const query = `
    SELECT 
      a.id,
      a.contenido AS texto,
      a.fecha_entrega,
      c.id AS id_clase,
      c.nombre AS nombre_clase
    FROM avisos a
    INNER JOIN clases c ON a.id_clase = c.id
    INNER JOIN clase_alumnos ca ON ca.id_clase = c.id
    LEFT JOIN entregas e ON e.id_tarea = a.id AND e.id_alumno = ?
    WHERE 
      ca.id_alumno = ?
      AND a.es_tarea = 1
      AND a.fecha_entrega IS NOT NULL
      AND a.fecha_entrega > NOW()
      AND e.id IS NULL
    ORDER BY a.fecha_entrega ASC
    LIMIT 5
  `;

  db.query(query, [idAlumno, idAlumno], (err, resultados) => {
    if (err) {
      console.error('Error al obtener tareas próximas:', err);
      return res.status(500).json({ mensaje: 'Error al obtener tareas próximas' });
    }

    res.json(resultados);
  });
};
