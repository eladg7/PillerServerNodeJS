const express = require('express');
const router = express.Router();
const profileService = require('./profileList.service');
const consts = require('_helpers/consts');

// routes
router.get(consts.profile.getAllProfilesRoute, getAllProfiles);
router.post(consts.profile.initProfileListRoute, initProfileList);
router.put(consts.profile.addProfileRoute, addProfile);
router.delete(consts.profile.deleteProfileRoute, deleteProfile);
router.delete(consts.profile.deleteAllProfilesRoute, deleteAllProfiles);


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
    profileService.addProfile(req.params.userId, req.body)
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
