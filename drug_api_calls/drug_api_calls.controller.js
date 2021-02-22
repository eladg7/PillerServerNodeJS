const express = require('express');
const router = express.Router();
const drugService = require('./drug_api_calls.service');

router.get('/drugByName/:drugName', findDrugByName);
router.get('/findInteractions/:newRxcui/:drugList', findInteractions);

module.exports = router;

function findDrugByName(req, res, next) {
    drugService.findDrugByName(req.params.drugName)
        .then(result => res.json(result))
        .catch(err => next(err));
}

function findInteractions(req, res, next) {
    drugService.findInteractions(req.params.newRxcui, req.params.drugList)
        .then(result => res.json(result))
        .catch(err => next(err));
}

