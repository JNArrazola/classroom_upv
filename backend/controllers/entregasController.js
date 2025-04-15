// controllers/entregasController.js
const db = require('../db');
const fs = require('fs');
const path = require('path');

// Guardar borrador o entrega
exports.entregarTarea = (req, res) => {
  const { id_tarea, id_alumno } = req.body;
  const archivos = req.files;

  if (!archivos || archivos.length === 0) {
    return res.status(400).json({ mensaje: 'Debes subir al menos un archivo' });
  }

  const fechaEntrega = new Date();
  const values = archivos.map((file) => [id_tarea, id_alumno, file.filename, fechaEntrega, false]);

  const query = `
    INSERT INTO entregas (id_tarea, id_alumno, archivo, fecha_entrega, entregado)
    VALUES ?
  `;

  db.query(query, [values], (err) => {
    if (err) {
      console.error('Error al guardar entrega:', err);
      return res.status(500).json({ mensaje: 'Error al guardar la entrega' });
    }

    res.status(201).json({ mensaje: 'Borrador guardado correctamente' });
  });
};

// Confirmar entrega (marcar entregado = true)
exports.confirmarEntrega = (req, res) => {
  const { id_tarea, id_alumno } = req.body;
  const query = `
    UPDATE entregas
    SET entregado = true
    WHERE id_tarea = ? AND id_alumno = ?
  `;

  db.query(query, [id_tarea, id_alumno], (err) => {
    if (err) {
      console.error('Error al confirmar entrega:', err);
      return res.status(500).json({ mensaje: 'Error al confirmar entrega' });
    }
    res.status(200).json({ mensaje: 'Entrega confirmada correctamente' });
  });
};

// Revertir entrega (marcar entregado = false, pero mantener calificación)
exports.revertirEntrega = (req, res) => {
  const { id_tarea, id_alumno } = req.body;
  const query = `
    UPDATE entregas
    SET entregado = false
    WHERE id_tarea = ? AND id_alumno = ?
  `;

  db.query(query, [id_tarea, id_alumno], (err) => {
    if (err) {
      console.error('Error al revertir entrega:', err);
      return res.status(500).json({ mensaje: 'Error al revertir entrega' });
    }
    res.status(200).json({ mensaje: 'Entrega deshecha correctamente, calificación conservada' });
  });
};

// Obtener todas las entregas (borradores o finales)
exports.getEntregasPorAlumno = (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT e.id, e.id_tarea, e.fecha_entrega, e.archivo, e.calificacion, e.entregado
    FROM entregas e
    WHERE e.id_alumno = ?
  `;

  db.query(query, [id], (err, resultados) => {
    if (err) {
      console.error('ERROR al obtener entregas del alumno:', err);
      return res.status(500).json({ mensaje: 'Error al obtener entregas del alumno' });
    }
    res.json(resultados || []);
  });
};

// Obtener entregas de una tarea incluyendo campo entregado
exports.getEntregasPorTarea = (req, res) => {
  const id_tarea = parseInt(req.params.id);

  const query = `
    SELECT 
      u.id AS id_alumno,
      u.nombre AS nombre_alumno,
      u.matricula,
      e.id AS id_entrega,
      e.archivo,
      e.fecha_entrega,
      e.calificacion,
      e.entregado
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
      calificacion: r.calificacion,
      entregado: r.entregado 
    }));    

    res.json(datos);
  });
};

exports.eliminarEntrega = (req, res) => {
  const { id } = req.params;

  const query = `SELECT archivo FROM entregas WHERE id = ?`;

  db.query(query, [id], (err, resultados) => {
    if (err || resultados.length === 0) {
      return res.status(500).json({ mensaje: 'No se pudo encontrar la entrega' });
    }

    const archivo = resultados[0].archivo;
    const ruta = path.join(__dirname, '..', 'storage', archivo);
    fs.unlink(ruta, () => {});

    db.query(`DELETE FROM entregas WHERE id = ?`, [id], (err) => {
      if (err) {
        return res.status(500).json({ mensaje: 'No se pudo eliminar la entrega' });
      }
      res.status(200).json({ mensaje: 'Entrega eliminada con éxito' });
    });
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


// Obtener entregado directamente por tarea y alumno
exports.getEntregadoPorAlumno = (req, res) => {
  const { id_tarea, id_alumno } = req.params;

  const query = `
    SELECT MAX(entregado) AS entregado
    FROM entregas
    WHERE id_tarea = ? AND id_alumno = ?
  `;

  db.query(query, [id_tarea, id_alumno], (err, resultados) => {
    if (err) {
      console.error('Error al obtener entregado:', err);
      return res.status(500).json({ mensaje: 'Error al obtener entregado' });
    }

    const entregado = resultados[0]?.entregado || 0;
    res.json({ entregado: Number(entregado) });
  });
};
