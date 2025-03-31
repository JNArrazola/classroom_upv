const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const avisosController = require('../controllers/avisosController');

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

router.delete('/:id', avisosController.eliminarAviso);
router.put('/:id', avisosController.editarAviso);
router.get('/clase/:id', avisosController.getAvisosPorClase);
router.post('/', upload.array('archivos'), avisosController.crearAviso);

module.exports = router;
