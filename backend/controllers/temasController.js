const db = require('../db');

exports.crearTema = (req, res) => {
  const { id_clase, nombre } = req.body;
  const query = 'INSERT INTO temas (id_clase, nombre) VALUES (?, ?)';

  db.query(query, [id_clase, nombre], (err, result) => {
    if (err) {
      console.error('Error al crear tema:', err);
      return res.status(500).json({ mensaje: 'Error al crear el tema' });
    }
    res.status(201).json({ id: result.insertId, nombre });
  });
};

exports.getTemasPorClase = (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM temas WHERE id_clase = ?', [id], (err, results) => {
    if (err) {
      console.error('Error al obtener temas:', err);
      return res.status(500).json({ mensaje: 'Error al obtener los temas' });
    }
    res.json(results);
  });
};
