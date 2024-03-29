﻿const config = require('../config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../_helpers/db');
const superviseService = require('../supervisors/supervisors.service');
const Profile = require('../profile/profile.model');
const ProfileListService = require('../profile/profileList.service');
const consts = require('../_helpers/consts');
const prepareResult = require('../_helpers/ResultPreparer');

const User = db.User;
const passwordGenerator = require('generate-password');
const sendMailHTML = require('../_helpers/mailManager');

const resetPasswordLength = 7;

module.exports = {
    authenticate,
    updateEmailUsernamePassword,
    createNewUser,
    deleteUser,
    emailResetPassword
    // deleteGoogleUser,
    // getGoogleAccount
};


async function authenticate({email, password}) {
    const user = await User.findOne({email});
    if (user && bcrypt.compareSync(password, user.password)) {
        const token = jwt.sign({sub: user.id}, config.secret, {expiresIn: consts.user.tokenExpire});
        const profileName = (await Profile.findById(user.profileId)).name;
        return prepareResult.prepareResult([consts.user.email, user.email], [consts.user.createDate, user.createDate],
            [consts.user.profileId, user.profileId], [consts.user.id, user._id.toString()],
            [consts.user.token, token], [consts.user.profileName, profileName]);
    }
}

async function emailResetPassword(email) {
    const user = await User.findOne({email: email});
    if (!user) throw `Email ${email} not found`;

    const newPassword = passwordGenerator.generate({
        length: resetPasswordLength,
        numbers: true
    });
    //  save hashed password
    user.password = bcrypt.hashSync(newPassword, consts.user.passwordSalt);
    await user.save();
    sendMailHTML([user.email], consts.user.passwordResetEmailTitle,
        `<p>Your password was reset in Piller, your new password is:<br>newPassword</p>`);
}


async function createNewUser(userParam) {
    // validate
    let user = await User.findOne({email: userParam.email})
    if (user) {
        //user already exists
        throw `Email ${userParam.email} is already taken`;
    }
    user = new User(userParam);
    await user.save();
    user.profileId = await createProfileForMainProfile(user.id, userParam.mainProfileName);

    // hash password
    if (userParam.password) {
        user.password = bcrypt.hashSync(userParam.password, consts.user.passwordSalt);
    }
    // save user
    await user.save();
}

async function createProfileForMainProfile(userId, profileName) {
    await ProfileListService.initProfileList(userId);
    let profileBody = {name: profileName, relation: consts.user.mainUserRelation};
    const profile = await ProfileListService.addProfile(userId, profileBody);
    return profile.id;
}

async function updateEmailUsernamePassword(userId, userParam) {
    const user = await User.findById(userId);
    // validate
    if (!user) throw `User ${userParam.email} not found`;
    checkPasswordValidation(userParam.oldPassword, user)

    // hash password if it was entered
    if (userParam.password) {
        userParam.password = bcrypt.hashSync(userParam.password, consts.user.passwordSalt);
    }
    user.password = userParam.password;
    user.email = userParam.email;
    await user.save();
    const profile = await Profile.findById(user.profileId);
    if (!profile) {
        throw consts.user.profileForUserDoesntExistError;
    }
    profile.name = userParam.mainProfileName;
    await profile.save();
}

async function deleteUser(userId, userParam) {
    const user = await User.findById(userId);
    // validate
    if (!user) throw `User ${userId} not found`;
    checkPasswordValidation(userParam.password, user)

    //delete profiles (calenders + occurence+intakedate)
    await ProfileListService.deleteAllProfiles(userId)
    //delete supervisors
    await superviseService.deleteSupervisorList(userId)


    await User.findByIdAndDelete(userId);
}

function checkPasswordValidation(password, user) {
    if (!bcrypt.compareSync(password, user.password)) {
        throw consts.user.wrongPasswordError;
    }
}


// async function updateEmail(userId, userParam) {
//     const user = await User.findById(userId);
//
//     // validate
//     if (!user) throw 'User ' + userParam.email + ' not found';
//     if (user.email !== userParam.email && await User.findOne({email: userParam.email})) {
//         throw 'Email "' + userParam.email + '" is already taken';
//     }
//
//     // hash password if it was entered
//     if (userParam.password) {
//         userParam.password = bcrypt.hashSync(userParam.password, 10);
//     }
//
//     // copy userParam properties to user
//     Object.assign(user, userParam);
//
//     await user.save();
// }
//
// async function updatePassword(userId, userParam) {
//     const user = await User.findById(userId);
//     // validate
//     if (!user) throw 'User ' + userParam.email + ' not found';
//     if (!bcrypt.compareSync(userParam.oldPassword, user.password)) {
//         throw 'Wrong password';
//     }
//
//     // hash password if it was entered
//     if (userData.password) {
//         userData.password = bcrypt.hashSync(userData.password, 10);
//     }
//     // copy userParam properties to user
//     Object.assign(user, userData);
//
//     await user.save();
// }


// async function deleteGoogleUser(userId) {
//     const user = await User.findById(userId);
//     // validate
//     if (!user) throw 'User ' + userId + ' not found';
//
//     //delete profiles (calenders + occurence+intakedate)
//     await ProfileListService.deleteAllProfiles(userId)
//     //delete supervisors
//     await superviseService.deleteSupervisorList(userId)
//     await User.findByIdAndDelete(userId);
// }
//
// async function getGoogleAccount(userParam) {
//     let user = await User.findOne({email: userParam.email});
//     if (!user) {
//         user = new User(userParam);
//         // save user
//         await user.save();
//         user.profileId = await createProfileForMainProfile(user.id, userParam.mainProfileName);
//         await user.save();
//     }
//
//     const profileName = (await Profile.findById(user.profileId)).name;
//     return {
//         ...user.toJSON(),
//         "profileId": user.profileId,
//         "profileName": profileName,
//         "googleUser": true
//     };
// }
