const express = require('express');
const router = express.Router();
const { crearClase } = require('../controllers/clasesController');
const { agregarAlumnoAClase } = require('../controllers/clasesController');

router.post('/', crearClase);
router.post('/:idClase/alumnos', agregarAlumnoAClase);

module.exports = router;
