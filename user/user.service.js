const config = require('config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('_helpers/db');
const superviseService = require('../supervisors/supervisors.service');
const Profile = require('../profile/profile.model');
const ProfileListService = require('../profile/profileList.service');


const User = db.User;
const passwordGenerator = require('generate-password');
const sendMailHTML = require('_helpers/mailManager');

const resetPasswordLength = 7;

module.exports = {
    authenticate,
    updateEmailUsernamePassword,
    create: createNewUser,
    updateEmail,
    updatePassword,
    delete: _delete,
    emailResetPassword
};

async function authenticate({email, password}) {
    const user = await User.findOne({email});
    if (user && bcrypt.compareSync(password, user.password)) {
        const token = jwt.sign({sub: user.id}, config.secret, {expiresIn: '7d'});
        const profileName = (await Profile.findById(user.profileId)).name;
        return {
            ...user.toJSON(),
            token,
            "profileId": user.profileId,
            "profileName": profileName
        };
    }
}

async function emailResetPassword(email) {
    const user = await User.findOne({email: email});
    if (!user) throw 'Email ' + email + ' not found';

    const newPassword = passwordGenerator.generate({
        length: resetPasswordLength,
        numbers: true
    });
    //  save hashed password
    user.password = bcrypt.hashSync(newPassword, 10);
    await user.save();
    sendMailHTML([user.email], 'Password Reset For Piller',
        "<p>Your password was reset in Piller, your new password is:<br>" + newPassword + "</p>")
}


async function createNewUser(userParam) {
    // validate
    if (await User.findOne({email: userParam.email})) {
        throw 'Email "' + userParam.email + '" is already taken';
    }
    const user = new User(userParam);
    // hash password
    if (userParam.password) {
        user.password = bcrypt.hashSync(userParam.password, 10);
    }
    // save user
    await user.save();
    user.profileId = await createProfileForMainProfile(user.id, userParam.mainProfileName);
    await user.save();
}

async function createProfileForMainProfile(userId, profileName) {
    await ProfileListService.initProfileList(userId);
    const profile = await ProfileListService.addProfile(userId, profileName,"main-user");
    return profile.id;
}

async function updateEmailUsernamePassword(userId, userParam) {
    const user = await User.findById(userId);
    // validate
    if (!user) throw 'User ' + userParam.email + ' not found';
    if (!bcrypt.compareSync(userParam.oldPassword, user.password)) {
        throw 'Wrong password';
    }

    // hash password if it was entered
    if (userParam.password) {
        userParam.password = bcrypt.hashSync(userParam.password, 10);
    }
    user.password = userParam.password;
    user.email = userParam.email;
    await user.save();
    const profile= await Profile.findById(user.profileId);
    if (!profile) {
        throw 'Profile for user does no exist.';
    }
    profile.name=userParam.mainProfileName;
    await profile.save();
}

async function _delete(email) {
    //delete profiles (calenders + occurence+intakedate)
    ProfileListService.deleteAllProfiles(email)
    //delete supervisors
    superviseService.deleteSupervisorList(email)


    await User.deleteOne({email: email});
}




async function updateEmail(userId, userParam) {
    const user = await User.findById(userId);

    // validate
    if (!user) throw 'User ' + userParam.email + ' not found';
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

async function updatePassword(userId, userParam) {
    const user = await User.findById(userId);
    // validate
    if (!user) throw 'User ' + userParam.email + ' not found';
    if (!bcrypt.compareSync(userParam.oldPassword, user.password)) {
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