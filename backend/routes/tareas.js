const express = require('express');
const router = express.Router();
const tareasController = require('../controllers/tareasController');
const verificarToken = require('../middlewares/authMiddleware');

// Obtener entregas de una tarea
router.get('/:id/entregas', verificarToken, tareasController.getEntregasPorTarea);

// Calificar una entrega
router.put('/entregas/:id', verificarToken, tareasController.calificarEntrega);

module.exports = router;
