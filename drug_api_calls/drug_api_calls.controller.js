const express = require('express');
const router = express.Router();
const drugService = require('./drug_api_calls.service');
const ocrService = require('../ocr/ocr.service');
const consts = require('../_helpers/consts');
const multer = require('multer');
const upload = multer();

router.get(consts.drugApiCalls.findDrugByNameRoute, findDrugByName);
router.get(consts.drugApiCalls.findInteractionsRoute, findInteractions);
router.get(consts.drugApiCalls.getDrugImageRoute, getDrugImage);
//  user upload.single because we will receive amn image as multi-part
router.post(consts.drugApiCalls.findDrugByImageRoute, upload.single('file'), findDrugByImage);
router.post(consts.drugApiCalls.findDrugByBoxImageRoute, upload.single('file'), findDrugByBoxImage);

module.exports = router;

function getDrugImage(req, res, next) {
    drugService.getDrugImage(req.query[consts.drug.rxcui])
        .then(result => res.json(result))
        .catch(err => next(err));
}

function findDrugByName(req, res, next) {
    drugService.findDrugByName(req.params.drugName)
        .then(result => res.json(result))
        .catch(err => next(err));
}

function findInteractions(req, res, next) {
    drugService.findInteractions(req.params.userId, req.params.profileId, req.params.newRxcui)
        .then(result => res.json(result))
        .catch(err => next(err));
}

function findDrugByImage(req, res, next) {
    drugService.findDrugByImage(req.file)
        .then(result => res.json(result))
        .catch(err => next(err));
}

function findDrugByBoxImage(req, res, next) {
    ocrService.findDrugByBoxImage(req.file)
        .then(result => res.json(result))
        .catch(err => next(err));
}
