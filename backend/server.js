const express = require('express');
const cors = require('cors');
const app = express();
const clasesRoutes = require('./routes/clases');
const db = require('./db');
const authRoutes = require('./routes/auth');

app.use(cors());
app.use(express.json());

app.use('/api/clases', clasesRoutes);
app.use('/api/auth', authRoutes);

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

const usuariosRoutes = require('./routes/usuarios');
app.use('/api/usuarios', usuariosRoutes);
