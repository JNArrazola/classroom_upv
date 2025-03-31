const express = require('express');
const router = express.Router();
const { crearClase } = require('../controllers/clasesController');
const { agregarAlumnoAClase } = require('../controllers/clasesController');
const { obtenerClasesDelMaestro } = require('../controllers/clasesController');
const { obtenerAlumnosDeClase } = require('../controllers/clasesController');

router.get('/:idClase/alumnos', obtenerAlumnosDeClase);


router.post('/', crearClase);
router.post('/:idClase/alumnos', agregarAlumnoAClase);

router.get('/:idClase/alumnos', obtenerAlumnosDeClase);
router.get('/maestro/:idMaestro', obtenerClasesDelMaestro);

module.exports = router;
