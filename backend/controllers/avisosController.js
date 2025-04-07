const db = require('../db');
const path = require('path');

exports.getAvisosPorClase = (req, res) => {
  const id_clase = parseInt(req.params.id);

  const queryAvisos = `
    SELECT a.id, a.contenido AS texto, a.creado_en AS fecha, a.id_clase,
           a.es_tarea, a.fecha_entrega
    FROM avisos a
    WHERE a.id_clase = ?
    ORDER BY a.creado_en DESC
  `;

  db.query(queryAvisos, [id_clase], (err, avisos) => {
    if (err) return res.status(500).json({ mensaje: 'Error al obtener avisos' });

    if (avisos.length === 0) return res.json([]);

    const ids = avisos.map(a => a.id);
    const placeholders = ids.map(() => '?').join(',');
    const queryArchivos = `
      SELECT id_aviso, ruta_archivo
      FROM archivos_avisos
      WHERE id_aviso IN (${placeholders})
    `;

    db.query(queryArchivos, ids, (err2, archivos) => {
      if (err2) return res.status(500).json({ mensaje: 'Error al obtener archivos' });

      const avisosConArchivos = avisos.map(a => ({
        ...a,
        es_tarea: Boolean(a.es_tarea), 
        fecha_entrega: a.fecha_entrega,
        archivos: archivos
          .filter(file => file.id_aviso === a.id)
          .map(file => file.ruta_archivo)
      }));

      res.json(avisosConArchivos);
    });
  });
};


// Crear un nuevo aviso con archivos
exports.crearAviso = (req, res) => {
  const { id_clase, texto, es_tarea, fecha_entrega, valor_maximo } = req.body;
  const archivos = req.files || [];
  const id_maestro = req.user.id;

  const esTareaBool = es_tarea === '1' || es_tarea === 1 || es_tarea === true || es_tarea === 'true';
  const fecha = esTareaBool ? fecha_entrega || null : null;
  const valorFinal = esTareaBool ? (valor_maximo || 100) : null;

  const insertAviso = `
    INSERT INTO avisos (id_clase, id_maestro, contenido, es_tarea, fecha_entrega, valor_maximo)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(insertAviso, [id_clase, id_maestro, texto, esTareaBool, fecha, valorFinal], (err, result) => {
    if (err) {
      console.error('Error al crear aviso/tarea:', err);
      return res.status(500).json({ mensaje: 'Error al crear aviso/tarea' });
    }

    const id_aviso = result.insertId;

    if (archivos.length === 0) {
      return res.status(201).json({ mensaje: 'Publicado sin archivos' });
    }

    const archivosData = archivos.map(file => [
      id_aviso,
      file.originalname,
      file.filename,
      file.mimetype.includes('pdf') ? 'pdf' : 'imagen'
    ]);

    const insertArchivos = `
      INSERT INTO archivos_avisos (id_aviso, nombre_archivo, ruta_archivo, tipo_archivo)
      VALUES ?
    `;

    db.query(insertArchivos, [archivosData], (err2) => {
      if (err2) {
        console.error('Error al guardar archivos:', err2);
        return res.status(500).json({ mensaje: 'Publicado, pero error al guardar archivos' });
      }

      res.status(201).json({ mensaje: 'Publicado correctamente con archivos' });
    });
  });
};


exports.getAvisoPorId = (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT 
      id,
      contenido AS texto,
      creado_en AS fecha,
      fecha_entrega,
      id_clase,
      es_tarea,
      valor_maximo
    FROM avisos
    WHERE id = ?
  `;

  db.query(query, [id], (err, resultados) => {
    if (err) {
      console.error('Error al obtener aviso por ID:', err);
      return res.status(500).json({ mensaje: 'Error interno' });
    }

    if (resultados.length === 0) {
      return res.status(404).json({ mensaje: 'Aviso no encontrado' });
    }

    const aviso = resultados[0];

    const queryArchivos = `SELECT ruta_archivo FROM archivos_avisos WHERE id_aviso = ?`;

    db.query(queryArchivos, [id], (err2, archivos) => {
      if (err2) {
        console.error('Error al obtener archivos del aviso:', err2);
        return res.status(500).json({ mensaje: 'Error al obtener archivos del aviso' });
      }

      aviso.archivos = archivos.map(a => a.ruta_archivo);
      res.json(aviso);
    });
  });
};



// Eliminar aviso y sus archivos
exports.eliminarAviso = (req, res) => {
  const id = parseInt(req.params.id);

  const query = `DELETE FROM avisos WHERE id = ?`;

  db.query(query, [id], (err, result) => {
    if (err) return res.status(500).json({ mensaje: 'Error al eliminar aviso' });

    if (result.affectedRows === 0) return res.status(404).json({ mensaje: 'Aviso no encontrado' });

    res.json({ mensaje: 'Aviso eliminado correctamente' });
  });
};

// Editar aviso (solo el texto)
exports.editarAviso = (req, res) => {
  const id = parseInt(req.params.id);
  const { texto } = req.body;

  const query = `UPDATE avisos SET contenido = ? WHERE id = ?`;

  db.query(query, [texto, id], (err, result) => {
    if (err) return res.status(500).json({ mensaje: 'Error al editar aviso' });

    if (result.affectedRows === 0) return res.status(404).json({ mensaje: 'Aviso no encontrado' });

    res.json({ mensaje: 'Aviso actualizado correctamente' });
  });
};


exports.getAvisosPorClaseAlumno = (req, res) => {
  const id_clase = parseInt(req.params.id);

  const queryAvisos = `
    SELECT a.id, a.contenido AS texto, a.creado_en AS fecha, a.id_clase, a.es_tarea, a.fecha_entrega
    FROM avisos a
    WHERE a.id_clase = ?
    ORDER BY a.creado_en DESC
  `;


  db.query(queryAvisos, [id_clase], (err, avisos) => {
    if (err) return res.status(500).json({ mensaje: 'Error al obtener avisos' });

    if (avisos.length === 0) return res.json([]);

    const ids = avisos.map(a => a.id);
    const placeholders = ids.map(() => '?').join(',');
    const queryArchivos = `
      SELECT id_aviso, nombre_archivo, ruta_archivo, tipo_archivo
      FROM archivos_avisos
      WHERE id_aviso IN (${placeholders})
    `;

    db.query(queryArchivos, ids, (err2, archivos) => {
      if (err2) return res.status(500).json({ mensaje: 'Error al obtener archivos de los avisos' });

      const avisosConArchivos = avisos.map(a => ({
        ...a,
        archivos: archivos
          .filter(file => file.id_aviso === a.id)
          .map(file => ({
            ruta_archivo: file.ruta_archivo,
            nombre_archivo: file.nombre_archivo
          }))
      }));

      res.json(avisosConArchivos);
    });
  });
};
