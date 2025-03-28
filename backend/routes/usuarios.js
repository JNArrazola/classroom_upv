const express = require('express');
const router = express.Router();
const { buscarUsuarios } = require('../controllers/usuariosController');

router.get('/buscar', buscarUsuarios);

module.exports = router;
