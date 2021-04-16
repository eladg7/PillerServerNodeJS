const express = require('express');
const router = express.Router();
const calendarService = require('./calendar.service');

// routes
router.post('/addDrug/:userId/:profileId', add_drug);
router.delete('/deleteDrug/:userId/:profileId', delete_drug);
router.get('/:userId/:profileId', getSpecificCalendar);
router.post('/updateDrug/:userId/:profileId/:drug_id', update_drug);
router.delete('/:userId/:profileId', _delete);
router.put('/deleteFutureOccurrencesOfDrugByUser/:userId/:profileId', deleteFutureOccurrencesOfDrugByUser);

module.exports = router;


function getSpecificCalendar(req, res, next) {
    calendarService.getSpecificCalendar(req.params.userId, req.params.profileId)
        .then(calendars => res.json(calendars))
        .catch(err => next(err));
}

function deleteFutureOccurrencesOfDrugByUser(req, res, next) {
    calendarService.deleteFutureOccurrencesOfDrugByUser(req.params.userId, req.params.profileId, req.query["drug_id"], req.query["repeat_end"])
        .then(() => res.json({}))
        .catch(err => next(err));
}

function update_drug(req, res, next) {
    calendarService.update_drug(req.params.userId, req.params.profileId, req.params.drug_id, req.body)
        .then(event_id_arr => res.json(event_id_arr))
        .catch(err => next(err));
}

//  req.query["drug_id"] means that it'll be in the end of the url with ?drug_id=....
function delete_drug(req, res, next) {
    calendarService.delete_drug(req.params.userId, req.params.profileId, req.query["drug_id"])
        .then(() => res.json({}))
        .catch(err => next(err));
}

function add_drug(req, res, next) {
    calendarService.add_new_drug(req.params.userId, req.params.profileId, req.body)
        .then(event_id => res.json(event_id))
        .catch(err => next(err));
}

function _delete(req, res, next) {
    calendarService.delete(req.params.userId, req.params.profileId)
        .then(() => res.json({}))
        .catch(err => next(err));
}
