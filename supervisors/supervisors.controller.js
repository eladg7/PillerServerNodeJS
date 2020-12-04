const express = require('express');
const router = express.Router();
const supervisorsService = require('./supervisors.service');

// routes
router.post('/:email', initSupervisors);
router.put('/threshold/:email/:threshold', updateThreshold);
router.get('/threshold/:email', getThreshold);
router.put('/counter/:email/:drugName', addMissedToCounterDrug);
router.delete('/counter/:email/:drugName', deleteDrugCounter);
router.delete('/:email', deleteSupervisorList);

module.exports = router;


function initSupervisors(req,res,next){
    supervisorsService.initSupervisors(req.params.email)
        .then(() => res.json({}))
        .catch(err => next(err));
}

function getThreshold(req,res,next){
    supervisorsService.getThreshold(req.params.email)
        .then(threshold => res.json(threshold))
        .catch(err => next(err));
}

function updateThreshold(req,res,next){
    supervisorsService.updateThreshold(req.params.email,req.params.threshold)
        .then(() => res.json({}))
        .catch(err => next(err));
}



function addMissedToCounterDrug(req,res,next){
    supervisorsService.addMissedCounterToDrug(req.params.email ,req.params.drugName)
        .then(isNotify => res.json(isNotify))
        .catch(err => next(err));
}


function deleteDrugCounter(req, res, next) {

    supervisorsService.deleteDrugCounter(req.params.email ,req.params.drugName)
        .then(() => res.json({}))
        .catch(err => next(err));
}



function deleteSupervisorList(req, res, next) {
    supervisorsService.deleteSupervisorList(req.params.email ,req.params.drugName)
        .then(() => res.json({}))
        .catch(err => next(err));
}