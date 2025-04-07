const express = require('express');
const router = express.Router();
const alumnoController = require('../controllers/alumnoController');

router.get('/:id/clases', alumnoController.getClasesDelAlumno);
router.get('/:id/tareas-proximas', alumnoController.obtenerTareasProximas);

module.exports = router;
