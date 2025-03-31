const express = require('express');
const router = express.Router();
const alumnoController = require('../controllers/alumnoController');

router.get('/:id/clases', alumnoController.getClasesDelAlumno);

module.exports = router;
