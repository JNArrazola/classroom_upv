const express = require('express');
const router = express.Router();
const temasController = require('../controllers/temasController');

// Rutas específicas primero
router.post('/:idTema/agregar-aviso', temasController.agregarAvisoATema);

// Luego rutas generales
router.get('/:id', temasController.getTemasPorClase);
router.post('/', temasController.crearTema);
router.put('/:id', temasController.editarTema);
router.delete('/:id', temasController.eliminarTema);

// 👇 ¡ESTO ES LO QUE SEGURAMENTE TE FALTÓ!
module.exports = router;
