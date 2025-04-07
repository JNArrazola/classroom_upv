const db = require('../db');

// Obtener todos los temas de una clase
exports.getTemasPorClase = (req, res) => {
  const idClase = parseInt(req.params.id);

  const queryTemas = `
    SELECT t.id, t.nombre
    FROM temas t
    WHERE t.id_clase = ?
    ORDER BY t.nombre ASC
  `;

  db.query(queryTemas, [idClase], async (err, temas) => {
    if (err) {
      console.error('Error al obtener temas:', err);
      return res.status(500).json({ mensaje: 'Error al obtener temas' });
    }

    // Cargar avisos relacionados con cada tema
    const temasConAvisos = await Promise.all(
      temas.map(tema => {
        return new Promise((resolve, reject) => {
          const queryAvisos = `
            SELECT a.id, a.contenido AS texto, a.es_tarea, a.es_material
            FROM avisos a
            INNER JOIN avisos_temas at ON at.id_aviso = a.id
            WHERE at.id_tema = ?
          `;
          db.query(queryAvisos, [tema.id], (err2, avisos) => {
            if (err2) return reject(err2);
            tema.avisos = avisos;
            resolve(tema);
          });
        });
      })
    );

    res.json(temasConAvisos);
  });
};

// Crear un nuevo tema
exports.crearTema = (req, res) => {
  const { id_clase, nombre } = req.body;

  if (!id_clase || !nombre) {
    return res.status(400).json({ mensaje: 'Faltan datos para crear el tema' });
  }

  const query = 'INSERT INTO temas (id_clase, nombre) VALUES (?, ?)';
  db.query(query, [id_clase, nombre], (err, result) => {
    if (err) {
      console.error('Error al crear tema:', err);
      return res.status(500).json({ mensaje: 'Error al crear tema' });
    }

    res.status(201).json({ mensaje: 'Tema creado correctamente', id: result.insertId });
  });
};

// Editar un tema existente
exports.editarTema = (req, res) => {
  const idTema = parseInt(req.params.id);
  const { nombre } = req.body;

  if (!nombre) {
    return res.status(400).json({ mensaje: 'El nombre es obligatorio' });
  }

  const query = 'UPDATE temas SET nombre = ? WHERE id = ?';
  db.query(query, [nombre, idTema], (err, result) => {
    if (err) {
      console.error('Error al editar tema:', err);
      return res.status(500).json({ mensaje: 'Error al editar tema' });
    }

    res.status(200).json({ mensaje: 'Tema actualizado correctamente' });
  });
};

// Eliminar un tema
exports.eliminarTema = (req, res) => {
  const idTema = parseInt(req.params.id);

  const query = 'DELETE FROM temas WHERE id = ?';
  db.query(query, [idTema], (err, result) => {
    if (err) {
      console.error('Error al eliminar tema:', err);
      return res.status(500).json({ mensaje: 'Error al eliminar tema' });
    }

    res.status(200).json({ mensaje: 'Tema eliminado correctamente' });
  });
};

// Agregar un aviso existente a un tema
exports.agregarAvisoATema = (req, res) => {
  const idTema = parseInt(req.params.idTema);
  const { id_aviso } = req.body;

  if (!id_aviso || isNaN(idTema)) {
    return res.status(400).json({ mensaje: 'Datos inválidos' });
  }

  const query = 'INSERT INTO avisos_temas (id_aviso, id_tema) VALUES (?, ?)';
  db.query(query, [id_aviso, idTema], (err, result) => {
    if (err) {
      console.error('Error al agregar aviso a tema:', err);
      return res.status(500).json({ mensaje: 'Error al agregar aviso al tema' });
    }

    res.status(200).json({ mensaje: 'Aviso agregado al tema correctamente' });
  });
};
