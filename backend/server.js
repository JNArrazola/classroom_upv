const express = require('express');
const cors = require('cors');
const app = express();
const clasesRoutes = require('./routes/clases');
const db = require('./db');
const authRoutes = require('./routes/auth');
const carrerasRoutes = require('./routes/carreras');
const avisosRoutes = require('./routes/avisos');
const path = require('path');
const alumnoRoutes = require('./routes/alumno');
const usuariosRoutes = require('./routes/usuarios');
const tareasRoutes = require('./routes/tareas');
const entregasRoutes = require('./routes/entregas');

app.use(cors());
app.use(express.json());

app.use('/api/temas', require('./routes/temas'));
app.use('/api/entregas', entregasRoutes);
app.use('/api/tareas', tareasRoutes);
app.use('/api/usuarios', usuariosRoutes); 
app.use('/api/avisos', avisosRoutes);
app.use('/api/clases', clasesRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/carreras', carrerasRoutes);
app.use('/api/alumno', alumnoRoutes);
app.use('/storage', express.static(path.join(__dirname, 'storage')));

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
