const express = require('express');
const router = express.Router();
const profileService = require('./profile.service');

// routes
router.get('/:email', getAllProfiles);
router.post('/:email/:name', addProfile);
router.delete('/:email/:name', deleteProfile);
router.delete('/:email', deleteAllProfiles);



module.exports = router;


function getAllProfiles(req, res, next) {

    profileService.getAllProfiles(req.params.email ,req.params.name)
        .then(calendars => res.json(calendars))
        .catch(err => next(err));
}

function addProfile(req, res, next) {
    profileService.addProfile(req.params.email, req.params.name)
        .then(() => res.json({}))
        .catch(err => next(err));
}


function deleteProfile(req, res, next) {
    profileService.deleteProfile(req.params.email ,req.params.name)
        .then(() => res.json({}))
        .catch(err => next(err));
}

function deleteAllProfiles(req, res, next) {
    profileService.deleteAllProfiles(req.params.email)
        .then(() => res.json({}))
        .catch(err => next(err));
}