const express = require('express');
const router = express.Router();
const { crearClase } = require('../controllers/clasesController');
const { agregarAlumnoAClase } = require('../controllers/clasesController');
const { obtenerClasesDelMaestro } = require('../controllers/clasesController');
const { obtenerAlumnosDeClase } = require('../controllers/clasesController');
const { eliminarAlumno } = require('../controllers/clasesController');
const { getDetalleClase } = require('../controllers/clasesController');
const { getDetalleClaseAlumno } = require('../controllers/clasesController');

router.get('/:idClase/alumnos', obtenerAlumnosDeClase);

router.post('/', crearClase);
router.post('/:idClase/alumnos', agregarAlumnoAClase);
router.get('/:id/detalle', getDetalleClase);
router.get('/:id/detalle', getDetalleClaseAlumno); 

router.delete('/:idClase/alumnos/:idAlumno', eliminarAlumno);
router.get('/:idClase/alumnos', obtenerAlumnosDeClase);
router.get('/maestro/:idMaestro', obtenerClasesDelMaestro);

module.exports = router;
