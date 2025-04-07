const db = require('../db');

exports.getEntregasPorTarea = (req, res) => {
    const id_tarea = parseInt(req.params.id);
  
    const query = `
      SELECT u.id AS id_alumno, u.nombre AS nombre_alumno, u.matricula,
             e.id AS id_entrega, e.archivo, e.fecha_entrega, e.calificacion
      FROM clase_alumnos ca
      INNER JOIN usuarios u ON ca.id_alumno = u.id
      LEFT JOIN entregas e ON e.id_alumno = u.id AND e.id_tarea = ?
      WHERE ca.id_clase = (
        SELECT id_clase FROM avisos WHERE id = ?
      )
    `;
  
    db.query(query, [id_tarea, id_tarea], (err, resultados) => {
      if (err) {
        console.error('Error al obtener entregas:', err);
        return res.status(500).json({ mensaje: 'Error al obtener entregas' });
      }
  
      const datos = resultados.map(r => ({
        id_alumno: r.id_alumno,
        nombre_alumno: r.nombre_alumno,
        matricula: r.matricula,
        id_entrega: r.id_entrega,
        archivo: r.archivo,
        fecha_entrega: r.fecha_entrega,
        calificacion: r.calificacion
      }));
  
      res.json(datos);
    });
  };
  

exports.calificarEntrega = (req, res) => {
  const id = parseInt(req.params.id);
  const { calificacion } = req.body;

  const query = `UPDATE entregas SET calificacion = ? WHERE id = ?`;

  db.query(query, [calificacion, id], (err, result) => {
    if (err) {
      console.error('Error al calificar entrega:', err);
      return res.status(500).json({ mensaje: 'Error al calificar entrega' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Entrega no encontrada' });
    }

    res.json({ mensaje: 'Calificación guardada' });
  });
};
