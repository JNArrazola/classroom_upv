const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const entregasController = require('../controllers/entregasController');
const verificarToken = require('../middlewares/verificarToken'); 

// Configuración de multer para subir archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'storage'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Rutas
router.post('/', upload.array('archivos', 5), entregasController.entregarTarea);
router.get('/alumno/:id/entregas', entregasController.getEntregasPorAlumno);
router.delete('/:id', entregasController.eliminarEntrega);
router.put('/:id', entregasController.calificarEntrega);

module.exports = router;
