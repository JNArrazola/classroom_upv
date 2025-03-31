const bcrypt = require('bcryptjs');
const db = require('../backend/db');

async function insertarUsuarios() {
  const usuarios = [
    {
      nombre: 'Juan Pérez',
      correo: 'juan@upv.edu.mx',
      contrasena: '123456',
      rol: 'maestro',
      matricula: null
    },
    {
      nombre: 'Ana Torres',
      correo: 'ana@upv.edu.mx',
      contrasena: '123456',
      rol: 'alumno',
      matricula: 'A123456'
    },
    {
      nombre: 'Luis Gómez',
      correo: 'luis@upv.edu.mx',
      contrasena: '123456',
      rol: 'alumno',
      matricula: 'A654321'
    }
  ];

  for (const usuario of usuarios) {
    const hashed = await bcrypt.hash(usuario.contrasena, 10);
    db.query(
      'INSERT INTO usuarios (nombre, correo, contrasena, rol, matricula) VALUES (?, ?, ?, ?, ?)',
      [usuario.nombre, usuario.correo, hashed, usuario.rol, usuario.matricula],
      (err, result) => {
        if (err) console.error(`Error al insertar ${usuario.nombre}:`, err);
        else console.log(`Usuario insertado: ${usuario.nombre}`);
      }
    );
  }
}

insertarUsuarios();
