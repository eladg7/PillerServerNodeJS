const express = require('express');
const router = express.Router();
const calendarService = require('./calendar.service');

// routes
router.get('/:email/:name', getByEmailAndName);
router.put('/:email/:name', update);
router.delete('/:email', _delete);

module.exports = router;


function getByEmailAndName(req, res, next) {

    calendarService.getByEmailAndName(req.params.email ,req.params.name)
        .then(calendars => res.json(calendars))
        .catch(err => next(err));
}

function update(req, res, next) {
    calendarService.update(req.params.email,req.params.name, req.body)
        .then(() => res.json({}))
        .catch(err => next(err));
}

function _delete(req, res, next) {
    calendarService.delete(req.params.email)
        .then(() => res.json({}))
        .catch(err => next(err));
}
