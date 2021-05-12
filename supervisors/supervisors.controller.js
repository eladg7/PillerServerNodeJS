const express = require('express');
const router = express.Router();
const supervisorsService = require('./supervisors.service');
const consts = require('_helpers/consts');

// routes
router.get(consts.supervisors.getSupervisorsRoute, getSupervisors);
router.get(consts.supervisors.updateConfirmationRoute, updateConfirmation);
router.post(consts.supervisors.addSupervisorRoute, addSupervisor);
router.delete(consts.supervisors.deleteSupervisorRoute, deleteSupervisor);
router.get(consts.supervisors.unsubscribeSupervisorRoute, unsubscribeSupervisor);
router.put(consts.supervisors.updateThresholdRoute, updateThreshold);
router.get(consts.supervisors.getThresholdRoute, getThreshold);
router.delete(consts.supervisors.deleteSupervisorListRoute, deleteSupervisorList);

module.exports = router;

function unsubscribeSupervisor(req, res, next) {
    deleteSupervisor(req, res, next);
}

function getSupervisors(req, res, next) {
    supervisorsService.getSupervisors(req.params.userId)
        .then(supervisors => res.json(supervisors))
        .catch(err => next(err));
}

function addSupervisor(req, res, next) {
    supervisorsService.addSupervisor(req.params.userId,
        req.params.supervisorName, req.params.supervisorEmail)
        .then(() => res.json({}))
        .catch(err => next(err));
}

function deleteSupervisor(req, res, next) {
    supervisorsService.deleteSupervisor(req.params.userId, req.params.supervisorEmail)
        .then(() => res.json({}))
        .catch(err => next(err));
}

function updateConfirmation(req, res, next) {
    supervisorsService.updateConfirmation(req.params.userId,
        req.params.supervisorName, req.params.supervisorEmail)
        .then(message => message ? res.status(200).json(consts.supervisors.confirmationSuccessMessage)
            : res.status(400).json({}))
        .catch(err => next(err));
}

function getThreshold(req, res, next) {
    supervisorsService.getThreshold(req.params.userId)
        .then(threshold => res.json(threshold))
        .catch(err => next(err));
}

function updateThreshold(req, res, next) {
    supervisorsService.updateThreshold(req.params.userId, req.params.threshold)
        .then(() => res.json({}))
        .catch(err => next(err));
}

function deleteSupervisorList(req, res, next) {
    supervisorsService.deleteSupervisorList(req.params.userId, req.params.drugName)
        .then(() => res.json({}))
        .catch(err => next(err));
}
