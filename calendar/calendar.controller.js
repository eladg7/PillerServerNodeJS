const express = require('express');
const router = express.Router();
const calendarService = require('./calendar.service');
const consts = require('_helpers/consts');

// routes
router.post(consts.calendar.addDrugRoute, add_drug);
router.delete(consts.calendar.deleteDrugRoute, delete_drug);
router.get(consts.calendar.getSpecificCalendarRoute, getSpecificCalendar);
router.post(consts.calendar.updateDrugRoute, update_drug);
router.delete(consts.calendar.deleteCalendarRoute, _delete);
router.put(consts.calendar.deleteFutureDrugRoute, deleteFutureOccurrencesOfDrugByUser);

module.exports = router;


function getSpecificCalendar(req, res, next) {
    calendarService.getSpecificCalendar(req.params.userId, req.params.profileId)
        .then(calendars => res.json(calendars))
        .catch(err => next(err));
}

function deleteFutureOccurrencesOfDrugByUser(req, res, next) {
    calendarService.deleteFutureOccurrencesOfDrugByUser(req.params.userId, req.params.profileId,
        req.query[consts.drug.drugId], req.query[consts.drug.repeatEnd])
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
    calendarService.delete_drug(req.params.userId, req.params.profileId, req.query[consts.drug.drugId])
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
