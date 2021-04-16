const express = require('express');
const router = express.Router();
const profileService = require('./profileList.service');

// routes
router.get('/:userId', getAllProfiles);
router.post('/:userId', initProfileList);
router.put('/:userId/:name', addProfile);
router.delete('/:userId/:profileId', deleteProfile);
router.delete('/:userId', deleteAllProfiles);


module.exports = router;

function initProfileList(req, res, next) {
    profileService.initProfileList(req.params.userId)
        .then(() => res.json({}))
        .catch(err => next(err));
}

function getAllProfiles(req, res, next) {
    profileService.getAllProfiles(req.params.userId)
        .then(profiles => res.json(profiles))
        .catch(err => next(err));
}

function addProfile(req, res, next) {
    profileService.addProfile(req.params.userId, req.params.name)
        .then(profiles => res.json(profiles))
        .catch(err => next(err));
}


function deleteProfile(req, res, next) {
    profileService.deleteProfile(req.params.userId, req.params.profileId)
        .then(() => res.json({}))
        .catch(err => next(err));
}

function deleteAllProfiles(req, res, next) {
    profileService.deleteAllProfiles(req.params.userId)
        .then(() => res.json({}))
        .catch(err => next(err));
}
