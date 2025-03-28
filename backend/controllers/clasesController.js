const db = require('../db');

const crearClase = (req, res) => {
    const { nombre, descripcion, codigo_grupo, cuatrimestre, id_carrera, id_maestro } = req.body;

    if (!nombre || !codigo_grupo || !cuatrimestre || !id_carrera || !id_maestro) {
        return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const query = `
        INSERT INTO clases (nombre, descripcion, codigo_grupo, cuatrimestre, id_carrera, id_maestro)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(query, [nombre, descripcion, codigo_grupo, cuatrimestre, id_carrera, id_maestro], (err, result) => {
        if (err) {
            console.error('Error al crear la clase:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        const nuevaClaseId = result.insertId;
        res.status(201).json({ message: 'Clase creada exitosamente', id: nuevaClaseId });
    });
};

const agregarAlumnoAClase = (req, res) => {
    const { idClase } = req.params;
    const { id_alumno } = req.body;

    if (!id_alumno) {
        return res.status(400).json({ error: 'Falta el ID del alumno' });
    }

    const validacionQuery = `
        SELECT * FROM clase_alumnos 
        WHERE id_clase = ? AND id_alumno = ?
    `;

    db.query(validacionQuery, [idClase, id_alumno], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Error al validar existencia' });

        if (rows.length > 0) {
            return res.status(409).json({ error: 'El alumno ya está registrado en esta clase' });
        }

        const insertQuery = `
            INSERT INTO clase_alumnos (id_clase, id_alumno) 
            VALUES (?, ?)
        `;

        db.query(insertQuery, [idClase, id_alumno], (err, result) => {
            if (err) return res.status(500).json({ error: 'Error al agregar alumno' });

            res.status(201).json({ message: 'Alumno agregado correctamente' });
        });
    });
};

module.exports = { crearClase, agregarAlumnoAClase };
