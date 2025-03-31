const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/buscar', (req, res) => {
  const termino = req.query.termino;

  const query = `
    SELECT id, nombre, correo, matricula
    FROM usuarios
    WHERE rol = 'alumno' AND (nombre LIKE ? OR matricula LIKE ?)
    LIMIT 10
  `;

  db.query(query, [`%${termino}%`, `%${termino}%`], (err, results) => {
    if (err) {
      console.error('Error al buscar usuarios:', err);
      return res.status(500).json({ error: 'Error al buscar usuarios' });
    }
    res.json(results);
  });
});

module.exports = router;
