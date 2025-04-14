const db = require('../db');

// Entrega de tarea con múltiples archivos
exports.entregarTarea = (req, res) => {
  const { id_tarea, id_alumno } = req.body;
  const archivos = req.files;

  if (!archivos || archivos.length === 0) {
    return res.status(400).json({ mensaje: 'Debes adjuntar al menos un archivo' });
  }

  const fechaEntrega = new Date();  

  // Eliminar entregas previas del mismo alumno y tarea
  const eliminarQuery = `
    DELETE FROM entregas
    WHERE id_tarea = ? AND id_alumno = ?
  `;

  db.query(eliminarQuery, [id_tarea, id_alumno], (err) => {
    if (err) {
      console.error('Error al eliminar entregas anteriores:', err);
      return res.status(500).json({ mensaje: 'Error interno al preparar la entrega' });
    }

    // Insertar múltiples archivos como entregas nuevas
    const insertQuery = `
      INSERT INTO entregas (id_tarea, id_alumno, archivo, fecha_entrega)
      VALUES ?
    `;

    const values = archivos.map(file => [id_tarea, id_alumno, file.filename, fechaEntrega]);

    db.query(insertQuery, [values], (err2) => {
      if (err2) {
        console.error('Error al guardar la entrega:', err2);
        return res.status(500).json({ mensaje: 'Error al entregar tarea' });
      }

      res.status(201).json({ mensaje: 'Tarea entregada correctamente' });
    });
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

// Calificar una entrega específica
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

// Eliminar una entrega por ID
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
