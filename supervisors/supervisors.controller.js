const express = require('express');
const router = express.Router();
const supervisorsService = require('./supervisors.service');

// routes
router.get('/:email', getSupervisors);
router.post('/:email/:supervisorName/:supervisorEmail', addSupervisor);
router.get('/confirmation/:email/:supervisorName/:supervisorEmail', updateConfirmation);
router.delete('/:email/:supervisorEmail', deleteSupervisor);

router.put('/threshold/:email/:threshold', updateThreshold);
router.get('/threshold/:email', getThreshold);


router.put('/counter/:email/:drugName', addMissedToCounterDrug);
router.delete('/counter/:email/:drugName', deleteDrugCounter);

router.delete('/:email', deleteSupervisorList);

module.exports = router;


function getSupervisors(req, res, next) {
    supervisorsService.getSupervisors(req.params.email)
        .then(supervisors => res.json(supervisors))
        .catch(err => next(err));
}

function addSupervisor(req, res, next) {
    supervisorsService.addSupervisor(req.params.email,
        req.params.supervisorName, req.params.supervisorEmail)
        .then(() => res.json({}))
        .catch(err => next(err));
}

function deleteSupervisor(req, res, next) {
    supervisorsService.deleteSupervisor(req.params.email, req.params.supervisorEmail)
        .then(() => res.json({}))
        .catch(err => next(err));
}

function updateConfirmation(req, res, next) {
    supervisorsService.updateConfirmation(req.params.email,
        req.params.supervisorName, req.params.supervisorEmail)
        .then(message => message ? res.status(200).json('Confirmation succeeded!')
            : res.status(400).json({}))
        .catch(err => next(err));
}

function getThreshold(req, res, next) {
    supervisorsService.getThreshold(req.params.email)
        .then(threshold => res.json(threshold))
        .catch(err => next(err));
}

function updateThreshold(req, res, next) {
    supervisorsService.updateThreshold(req.params.email, req.params.threshold)
        .then(() => res.json({}))
        .catch(err => next(err));
}


function addMissedToCounterDrug(req, res, next) {
    supervisorsService.addMissedCounterToDrug(req.params.email, req.params.drugName)
        .then(isNotify => res.json(isNotify))
        .catch(err => next(err));
}


function deleteDrugCounter(req, res, next) {

    supervisorsService.deleteDrugCounter(req.params.email, req.params.drugName)
        .then(() => res.json({}))
        .catch(err => next(err));
}


function deleteSupervisorList(req, res, next) {
    supervisorsService.deleteSupervisorList(req.params.email, req.params.drugName)
        .then(() => res.json({}))
        .catch(err => next(err));
}