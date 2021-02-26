const express = require('express');
const router = express.Router();
const calendarService = require('./calendar.service');

// routes
router.post('/addDrug/:email/:name', add_drug);
router.delete('/deleteDrug/:email/:name', delete_drug);
router.get('/:email/:name', getByEmailAndName);
router.post('/updateDrug/:email/:name', update_drug);
router.delete('/:email', _delete);
router.put('/deleteFutureOccurrencesOfDrugByUser/:email/:name', deleteFutureOccurrencesOfDrugByUser);

module.exports = router;


function getByEmailAndName(req, res, next) {
    calendarService.getByEmailAndName(req.params.email, req.params.name)
        .then(calendars => res.json(calendars))
        .catch(err => next(err));
}

function deleteFutureOccurrencesOfDrugByUser(req, res, next) {
    calendarService.deleteFutureOccurrencesOfDrugByUser(req.params.email, req.params.name, req.query["rxcui"], req.query["repeat_end"])
        .then(() => res.json({}))
        .catch(err => next(err));
}

function update_drug(req, res, next) {
    calendarService.update_drug(req.params.email, req.params.name, req.body)
        .then(event_id_arr => res.json(event_id_arr))
        .catch(err => next(err));
}

//  req.query["rxcui"] means that it'll be in the end of the url with ?rxcui=12345
function delete_drug(req, res, next) {
    calendarService.delete_drug(req.params.email, req.params.name, req.query["rxcui"])
        .then(event_id => res.json(event_id))
        .catch(err => next(err));
}

function add_drug(req, res, next) {
    calendarService.add_new_drug(req.params.email, req.params.name, req.body)
        .then(event_id => res.json(event_id))
        .catch(err => next(err));
}

function _delete(req, res, next) {
    calendarService.delete(req.params.email)
        .then(() => res.json({}))
        .catch(err => next(err));
}
