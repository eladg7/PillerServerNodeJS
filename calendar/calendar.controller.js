const express = require('express');
const router = express.Router();
const calendarService = require('./calendar.service');

// routes
router.post('/addDrug/:email/:name', add_drug);
router.delete('/deleteDrug/:email/:name', delete_drug);
router.get('/:email/:name', getByEmailAndName);
router.put('/:email/:name', update);
router.delete('/:email', _delete);

module.exports = router;


function getByEmailAndName(req, res, next) {
    calendarService.getByEmailAndName(req.params.email, req.params.name)
        .then(calendars => res.json(calendars))
        .catch(err => next(err));
}

function update(req, res, next) {
    calendarService.update_drug(req.params.email, req.params.name, req.body)
        .then(() => res.json({}))
        .catch(err => next(err));
}

function delete_drug(req, res, next) {
    calendarService.delete_drug(req.params.email, req.params.name, req.body)
        .then(() => res.json({}))
        .catch(err => next(err));
}

function add_drug(req, res, next) {
    calendarService.add_drug(req.params.email, req.params.name, req.body)
        .then(() => res.json({}))
        .catch(err => next(err));
}

function _delete(req, res, next) {
    calendarService.delete(req.params.email)
        .then(() => res.json({}))
        .catch(err => next(err));
}
