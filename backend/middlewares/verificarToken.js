const jwt = require('jsonwebtoken');
const claveSecreta = 'mi_clave_secreta'; 

module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) return res.status(401).json({ mensaje: 'Token no proporcionado' });

  const token = authHeader.split(' ')[1]; 

  if (!token) return res.status(401).json({ mensaje: 'Token no válido' });

  try {
    const usuario = jwt.verify(token, claveSecreta);
    req.user = usuario;
    next();
  } catch (error) {
    return res.status(403).json({ mensaje: 'Token inválido o expirado' });
  }
};
