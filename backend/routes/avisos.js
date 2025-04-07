const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const avisosController = require('../controllers/avisosController');
const verificarToken = require('../middlewares/authMiddleware'); 
const { getAvisosPorClaseAlumno } = require('../controllers/avisosController');

router.delete('/:id', avisosController.eliminarAviso);
router.put('/:id', avisosController.editarAviso);
router.get('/clase/:id/alumno', getAvisosPorClaseAlumno);
router.get('/:id', avisosController.getAvisoPorId);
router.get('/clase/:idClase', avisosController.getAvisosPorClase);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '..', 'storage');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const safeName = file.originalname.replace(/\s+/g, '_');
        cb(null, Date.now() + '-' + safeName);
    }
});

const upload = multer({ storage });

router.post('/', verificarToken, upload.array('archivos'), avisosController.crearAviso);
router.post('/material', upload.array('archivos', 5), avisosController.crearMaterial);

module.exports = router;
