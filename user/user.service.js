﻿const config = require('config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('_helpers/db');
const User = db.User;

module.exports = {
    authenticate,
    create,
    update,
    updatePassword,
    delete: _delete
};

async function authenticate({email, password}) {
    const user = await User.findOne({email});
    if (user && bcrypt.compareSync(password, user.password)) {
        const token = jwt.sign({sub: user.id}, config.secret, {expiresIn: '7d'});
        return {
            ...user.toJSON(),
            token
        };
    }
}

async function create(userParam) {
    console.log(userParam);
    // validate
    if (await User.findOne({email: userParam.email})) {
        throw 'Email "' + userParam.name + '" is already taken';
    }

    const user = new User(userParam);

    // hash password
    if (userParam.password) {
        user.password = bcrypt.hashSync(userParam.password, 10);
    }

    // save user
    await user.save();
}

async function updatePassword(email, userParam) {
    const user = await User.findOne({email: email});

    // validate
    if (!user) throw 'User ' + email + ' not found';
    const userData = userParam.nameValuePairs
    if (!bcrypt.compareSync(userData.oldPassword, user.password)) {
        throw 'Wrong password';
    }

    // hash password if it was entered
    if (userData.password) {
        userData.password = bcrypt.hashSync(userData.password, 10);
    }
    // copy userParam properties to user
    Object.assign(user, userData);

    await user.save();
}

async function update(email, userParam) {
    const user = await User.findOne({email: email});

    // validate
    if (!user) throw 'User ' + email + ' not found';
    if (user.email !== userParam.email && await User.findOne({email: userParam.email})) {
        throw 'Email "' + userParam.email + '" is already taken';
    }

    // hash password if it was entered
    if (userParam.password) {
        userParam.password = bcrypt.hashSync(userParam.password, 10);
    }

    // copy userParam properties to user
    Object.assign(user, userParam);

    await user.save();
}

async function _delete(email) {
    //  todo delete everything that the user has - calendar, supervisors etc.
    await User.deleteOne({email: email});
}
