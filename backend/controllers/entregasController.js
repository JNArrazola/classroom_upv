const db = require('../db');

// Entrega de tarea por parte del alumno (puede actualizar si ya existía)
exports.entregarTarea = (req, res) => {
    const { id_tarea, id_alumno } = req.body;
    const archivo = req.files && req.files[0];

  if (!archivo) {
    return res.status(400).json({ mensaje: 'Debes adjuntar un archivo' });
  }

  const rutaArchivo = archivo.filename;
  const fechaEntrega = new Date();

  const query = `
    INSERT INTO entregas (id_tarea, id_alumno, archivo, fecha_entrega)
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE archivo = VALUES(archivo), fecha_entrega = VALUES(fecha_entrega)
  `;

  db.query(query, [id_tarea, id_alumno, rutaArchivo, fechaEntrega], (err) => {
    if (err) {
      console.error('Error al guardar entrega:', err);
      return res.status(500).json({ mensaje: 'Error al entregar tarea' });
    }

    res.status(201).json({ mensaje: 'Tarea entregada correctamente' });
  });
};

// Obtener todas las entregas de un alumno
exports.getEntregasPorAlumno = (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT e.id, e.id_tarea, e.fecha_entrega, e.archivo, e.calificacion
    FROM entregas e
    WHERE e.id_alumno = ?
  `;

  db.query(query, [id], (err, resultados) => {
    if (err) {
      console.error('ERROR al obtener entregas del alumno:', err.sqlMessage || err.message || err);
      return res.status(500).json({ mensaje: 'Error al obtener entregas del alumno' });
    }

    res.json(resultados || []);
  });
};

exports.calificarEntrega = (req, res) => {
    const { id } = req.params;
    const { calificacion } = req.body;
  
    const query = `
      UPDATE entregas
      SET calificacion = ?
      WHERE id = ?
    `;
  
    db.query(query, [calificacion, id], (err, result) => {
      if (err) {
        console.error('Error al calificar entrega:', err);
        return res.status(500).json({ mensaje: 'No se pudo calificar la entrega' });
      }
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ mensaje: 'Entrega no encontrada' });
      }
  
      res.status(200).json({ mensaje: 'Calificación actualizada correctamente' });
    });
  };
  

// PUT /api/entregas/:id
exports.eliminarEntrega = (req, res) => {
    const { id } = req.params;
  
    const query = `DELETE FROM entregas WHERE id = ?`;
  
    db.query(query, [id], (err, resultado) => {
      if (err) {
        console.error('Error al eliminar entrega:', err);
        return res.status(500).json({ mensaje: 'No se pudo eliminar la entrega' });
      }
  
      if (resultado.affectedRows === 0) {
        return res.status(404).json({ mensaje: 'Entrega no encontrada' });
      }
  
      res.status(200).json({ mensaje: 'Entrega eliminada con éxito' });
    });
  };
  