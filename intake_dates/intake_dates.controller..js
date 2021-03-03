const express = require('express');
const router = express.Router();
const IntakeService = require('./intake_dates.service');

// routes
router.post('/addIntake/:taken_id/:date', addIntake);
router.delete('/removeIntake/:taken_id/:date', removeIntake);
router.get('/getAllIntakes/:taken_id', getAllIntakes);

module.exports = router;


function addIntake(req, res, next) {
    IntakeService.addIntake(req.params.taken_id, req.params.date)
        .then(() => res.json({}))
        .catch(err => next(err));
}

function removeIntake(req, res, next) {
    IntakeService.removeIntake(req.params.taken_id, req.params.date)
        .then(() => res.json({}))
        .catch(err => next(err));
}

function getAllIntakes(req, res, next) {
    IntakeService.getAllIntakes(req.params.taken_id)
        .then(taken => res.json(taken))
        .catch(err => next(err));
}
