const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SECRET_KEY = 'mi_clave_secreta'; // Puedes moverla a una variable de entorno

const login = (req, res) => {
    const { correo, contrasena } = req.body;

    if (!correo || !contrasena) {
        return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });
    }

    const query = 'SELECT * FROM usuarios WHERE correo = ?';

    db.query(query, [correo], async (err, results) => {
        if (err) return res.status(500).json({ error: 'Error al consultar usuario' });

        if (results.length === 0) {
            return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
        }

        const usuario = results[0];

        const esValida = await bcrypt.compare(contrasena, usuario.contrasena);
        if (!esValida) {
            return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
        }

        const token = jwt.sign(
            { id: usuario.id, nombre: usuario.nombre, rol: usuario.rol },
            SECRET_KEY,
            { expiresIn: '2h' }
        );

        res.json({ token });
    });
};

module.exports = { login };
