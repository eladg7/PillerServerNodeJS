const config = require('config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('_helpers/db');
const calendarService = require('../calendar/calendar.service');


const Profile = db.Profile;

module.exports = {
    getAllProfiles,
    addProfile,
    deleteAllProfiles,
    deleteProfile,
    initProfileList
};

async function initProfileList(email, profileName) {
    var userProfiles = await Profile.findOne({email: email})
    if (!userProfiles) {
        userProfiles = new Profile({email: email, mainProfile: profileName, secondaryProfileList: []})
        await userProfiles.save()
    }
}


async function getAllProfiles(email) {
    var profileList = [];
    var userProfiles = await Profile.findOne({email: email})
    profileList.push(userProfiles.mainProfile)
    if (userProfiles) {
        const profiles = userProfiles.secondaryProfileList;
        for (var i = 0; i < profiles.length; i++) {
            const profile_name = profiles[i];
            profileList.push(profile_name);
        }
    }
    return {"profile_list": profileList};
}


async function addProfile(email, profileName) {
    var userProfiles = await Profile.findOne({email: email})
    if (!userProfiles) {
        throw 'Profiles does not exist.';
    }

    if (userProfiles.secondaryProfileList.indexOf(profileName) >= 0
        || userProfiles.mainProfile === profileName) {
        // exists in list
        throw 'Profile already exists.';

    } else {
        userProfiles.secondaryProfileList.push(profileName)
        await userProfiles.save()
    }
}


async function deleteProfile(email, name) {
    var userProfiles = await Profile.findOne({email: email});
    if (userProfiles) {
        var profileList = userProfiles.secondaryProfileList;
        for (var i = 0; i < profileList.length; i++) {
            if (profileList[i] === name) {
                profileList.splice(i, 1);
                try{
                    // the profile may not have a calendar yet
                    await calendarService.delete(email,name);
                }catch (e) {
                    console.error(e);
                }
                break;
            }
        }
        userProfiles.save();

    }
}

async function deleteAllProfiles(email) {
    var userProfiles = await Profile.findOne({email: email})
    if (userProfiles) {
        await calendarService.delete(email,userProfiles.mainProfile)
        var profileList = userProfiles.secondaryProfileList
        for (let i = 0; i < profileList.length; i++) {
            await calendarService.delete(email, profileList[i].name)
        }
        userProfiles.save()

    }
    await Profile.deleteOne({email: email});
}