const express = require('express');
const router = express.Router();
const userService = require('./user.service');

// routes
router.post('/authenticate', authenticate);
router.post('/register', register);
router.put('/:email', update);
router.put('/updatePassword/:email', updatePassword);
router.delete('/:email', _delete);

module.exports = router;

function authenticate(req, res, next) {
    userService.authenticate(req.body)
        .then(user => user ? res.json(user) : res.status(400).json({message: 'Username or password is incorrect'}))
        .catch(err => next(err));
}

function register(req, res, next) {
    userService.create(req.body)
        .then(() => res.json({}))
        .catch(err => next(err));
}

function updatePassword(req, res, next) {
    userService.updatePassword(req.params.email, req.body)
        .then(() => res.json({}))
        .catch(err => next(err));
}

function update(req, res, next) {
    userService.update(req.params.email, req.body)
        .then(() => res.json({}))
        .catch(err => next(err));
}

function _delete(req, res, next) {
    userService.delete(req.params.email)
        .then(() => res.json({}))
        .catch(err => next(err));
}
