const express = require('express');
const router = express.Router();
const OcrService = require('./ocr.service');
const multer = require('multer');
const upload = multer();
const consts = require('_helpers/consts');

// routes
router.post(consts.ocr.findDrugByBoxImageRoute, upload.single('file'), findDrugByBoxImage);

module.exports = router;

function findDrugByBoxImage(req, res, next) {
    OcrService.findDrugByBoxImage(req.file)
        .then(result => res.json(result))
        .catch(err => next(err));
}
