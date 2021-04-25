const express = require('express');
const router = express.Router();
const userService = require('./user.service');

// routes
router.get('/resetPassword/:email', emailResetPassword);
router.post('/authenticate', authenticate);
router.post('/register', register);
router.post('/:userId', updateEmailUsernamePassword);
router.delete('/:userId', deleteUser);

router.post('/googleUser/getGoogleAccount', getGoogleAccount);
router.delete('/googleUser/:userId', deleteUser);
module.exports = router;


function emailResetPassword(req, res, next) {
    userService.emailResetPassword(req.params.email)
        .then(() => res.json({}))
        .catch(err => next(err));
}

function authenticate(req, res, next) {
    userService.authenticate(req.body)
        .then(user => user ? res.json(user) : res.status(400).json({message: 'Username or password is incorrect'}))
        .catch(err => next(err));
}

function register(req, res, next) {
    userService.createNewUser(req.body)
        .then(() => res.json({}))
        .catch(err => next(err));
}

function updateEmailUsernamePassword(req, res, next) {
    userService.updateEmailUsernamePassword(req.params.userId, req.body)
        .then(() => res.json({}))
        .catch(err => next(err));
}


function deleteUser(req, res, next) {
    userService.deleteUser(req.params.userId,req.body)
        .then(() => res.json({}))
        .catch(err => next(err));
}


function getGoogleAccount(req, res, next) {
    userService.getGoogleAccount(req.body)
        .then(user => res.json(user))
        .catch(err => next(err));
}


function deleteGoogleUser(req, res, next) {
    userService.deleteGoogleUser(req.params.userId)
        .then(() => res.json({}))
        .catch(err => next(err));
}
