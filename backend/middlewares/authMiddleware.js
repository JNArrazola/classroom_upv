// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const SECRET_KEY = 'mi_clave_secreta';

const verificarToken = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) return res.status(403).json({ error: 'Token no proporcionado' });

    try {
        const decoded = jwt.verify(token.split(' ')[1], SECRET_KEY);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Token inválido o expirado' });
    }
};

module.exports = verificarToken;
