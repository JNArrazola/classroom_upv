const db = require('../db');

const buscarUsuarios = (req, res) => {
    const { termino } = req.query;

    if (!termino) {
        return res.status(400).json({ error: 'Debe proporcionar un término de búsqueda' });
    }

    const query = `
        SELECT id, nombre, correo, matricula 
        FROM usuarios 
        WHERE rol = 'alumno' AND (nombre LIKE ? OR matricula LIKE ?)
        LIMIT 10
    `;

    const likeTerm = `%${termino}%`;

    db.query(query, [likeTerm, likeTerm], (err, results) => {
        if (err) return res.status(500).json({ error: 'Error en la búsqueda' });

        res.json(results);
    });
};

module.exports = { buscarUsuarios };
