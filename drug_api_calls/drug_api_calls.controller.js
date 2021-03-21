const express = require('express');
const router = express.Router();
const drugService = require('./drug_api_calls.service');
const multer = require('multer');
const upload = multer();

router.get('/drugByName/:drugName', findDrugByName);
router.get('/findInteractions/:email/:profileName/:newRxcui', findInteractions);
router.get('/getDrugImage', getDrugImage);
//  user upload.single because we will receive amn image as multi-part
router.post('/findDrugByImage', upload.single('file'), findDrugByImage);

module.exports = router;

function getDrugImage(req, res, next) {
    drugService.getDrugImage(req.query["rxcui"])
        .then(result => res.json(result))
        .catch(err => next(err));
}

function findDrugByName(req, res, next) {
    drugService.findDrugByName(req.params.drugName)
        .then(result => res.json(result))
        .catch(err => next(err));
}

function findInteractions(req, res, next) {
    drugService.findInteractions(req.params.email, req.params.profileName, req.params.newRxcui)
        .then(result => res.json(result))
        .catch(err => next(err));
}

function findDrugByImage(req, res, next) {
    drugService.findDrugByImage(req.file)
        .then(result => res.json(result))
        .catch(err => next(err));
}
