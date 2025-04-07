const express = require('express');
const router = express.Router();
const temasController = require('../controllers/temasController');

router.post('/', temasController.crearTema);             // Crear nuevo tema
router.get('/clase/:id', temasController.getTemasPorClase); // Obtener temas de una clase

module.exports = router;
