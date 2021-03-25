const express = require('express');
const router = express.Router();
const IntakeService = require('./intake_dates.service');

// routes
router.post('/setIntakeTaken/:taken_id/:refill_id/:date', setIntakeTaken);
router.post('/setIntakeNotTaken/:taken_id/:refill_id/:date', setIntakeNotTaken);
router.get('/getAllIntakes/:taken_id', getAllIntakes);

module.exports = router;


function setIntakeTaken(req, res, next) {
    IntakeService.setIntake(req.params.taken_id,req.params.refill_id, req.params.date, true)
        .then(pillsLeft => res.json(pillsLeft))
        .catch(err => next(err));
}

function setIntakeNotTaken(req, res, next) {
    IntakeService.setIntake(req.params.taken_id, req.params.refill_id, req.params.date, false)
        .then(pillsLeft => res.json(pillsLeft))
        .catch(err => next(err));
}

function getAllIntakes(req, res, next) {
    IntakeService.getAllIntakes(req.params.taken_id)
        .then(taken => res.json(taken))
        .catch(err => next(err));
}
