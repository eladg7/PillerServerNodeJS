const db = require('_helpers/db');
const calendarService = require('../calendar/calendar.service');
const User = db.User;
const ProfileList = db.ProfileList;
const Profile = db.Profile;

module.exports = {
    getAllProfiles,
    addProfile,
    deleteAllProfiles,
    deleteProfile,
    initProfileList
};

async function initProfileList(userId) {
    var userProfiles = await ProfileList.findById(userId);
    if (!userProfiles) {
        userProfiles = new ProfileList({userId: userId, secondaryProfileList: []})
        await userProfiles.save()
    }
}


async function getAllProfiles(userId) {
    const allProfiles = [];
    const mainProfileName = (await User.findById(userId)).mainProfileName;
    allProfiles.push({"id": userId, "name": mainProfileName});

    const userProfiles = await ProfileList.findById(userId);
    if (userProfiles) {
        const secondaryProfiles = userProfiles.secondaryProfileList;
        for (var i = 0; i < secondaryProfiles.length; i++) {
            const profileId = secondaryProfiles[i].id;
            const profileName = secondaryProfiles[i].name;
            allProfiles.push({"id": profileId, "name": profileName});
        }
    }
    return {"profile_list": allProfiles};
}


async function addProfile(userId, profileName) {
    const profileList = await ProfileList.findById(userId);
    if (!profileList) {
        throw 'Profiles does not exist.';
    }
    const mainProfileName = (await User.findById(userId)).mainProfileName;
    if (isProfileNameExists(profileName,profileList.secondaryProfileList)
        || mainProfileName === profileName) {
        // exists in list
        throw 'Profile already exists.';
    }

    var profile=  new Profile({name: profileName});
    await profile.save();
    profileList.secondaryProfileList.push({"id": profile.id, "name": profileName})
    await profileList.save()

    return {"id": profile.id, "name": profileName};
}

function isProfileNameExists(profileName, secondaryProfiles) {
    var result=false;
    for (var i = 0; i < secondaryProfiles.length; i++) {
        if(secondaryProfiles[i].name ===profileName){
            result=true;
            break;
        }
    }
    return result;
}

async function deleteProfile(userId, profileId) {
    var profileList = await ProfileList.findById(userId);
    if (profileList) {
        for (var i = 0; i < profileList.secondaryProfileList.length; i++) {
            if (profileList.secondaryProfileList[i].id === profileId) {
                profileList.secondaryProfileList.splice(i, 1);
                try {
                    // the profile may not have a calendar yet
                    await calendarService.delete(userId, profileId);
                } catch (e) {
                    console.error(e);
                }
                break;
            }
        }
        profileList.save();
    }
}

async function deleteAllProfiles(userId) {
    var userProfiles = await ProfileList.findById(userId);
    if (userProfiles) {
        await calendarService.delete(userId, userId);

        for (let i = 0; i < userProfiles.secondaryProfileList.length; i++) {
            try {
                // the profile may not have a calendar yet
                await calendarService.delete(userId, userProfiles.secondaryProfileList[i].id);
            } catch (e) {
                console.error(e);
            }
        }
        userProfiles.save()

    }
    await ProfileList.findByIdAndDelete(userId);
}
