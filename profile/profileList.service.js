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
    var userProfile = await ProfileList.findOne({userId: userId});
    if (!userProfile) {
        userProfile = new ProfileList({userId: userId, secondaryProfileIdList: []})
        await userProfile.save()
    }
}


async function getAllProfiles(userId) {
    const allProfiles = [];
    const mainProfileName = (await User.findById(userId)).mainProfileName;
    allProfiles.push({"id": userId, "name": mainProfileName});

    const userProfile = await ProfileList.findOne({userId: userId});
    if (userProfile) {
        const secondaryProfiles = userProfile.secondaryProfileIdList;
        for (var i = 0; i < secondaryProfiles.length; i++) {
            const profile = await Profile.findById(secondaryProfiles[i]);
            const profileId = await profile.id;
            const profileName = profile.name;
            allProfiles.push({"id": profileId, "name": profileName});
        }
    }
    return {"profile_list": allProfiles};
}


async function addProfile(userId, profileName) {
    const userProfile = await ProfileList.findOne({userId: userId});
    if (!userProfile) {
        throw 'Profiles does not exist.';
    }
    const mainProfileName = (await User.findById(userId)).mainProfileName;
    const isProfileAlreadyInList=await isProfileNameExists(profileName, userProfile.secondaryProfileIdList);
    if ( isProfileAlreadyInList || mainProfileName === profileName) {
        // exists in list
        throw 'Profile already exists.';
    }

    const profile = new Profile({name: profileName});
    await profile.save();
    userProfile.secondaryProfileIdList.push({"id": profile.id, "name": profileName})
    await userProfile.save()

    return {"id": profile.id, "name": profileName};
}

async function isProfileNameExists(profileName, secondaryProfiles) {
    var result = false;
    for (var i = 0; i < secondaryProfiles.length; i++) {
        const profile = await Profile.findById(secondaryProfiles[i]);
        if (profile.name === profileName) {
            result = true;
            break;
        }
    }
    return result;
}

async function deleteProfile(userId, profileId) {
    const userProfile = await ProfileList.findOne({userId: userId});
    if (userProfile) {
        for (var i = 0; i < userProfile.secondaryProfileIdList.length; i++) {
            const profile = await Profile.findById(secondaryProfiles[i]);
            if (profile.id === profileId) {
                userProfile.secondaryProfileIdList.splice(i, 1);
                try {
                    // the profile may not have a calendar yet
                    await calendarService.delete(userId, profileId);
                } catch (e) {
                    console.error(e);
                }
                break;
            }
        }
        await userProfile.save();
    }
}

async function deleteAllProfiles(userId) {
    const userProfile = await ProfileList.findOne({userId: userId});
    if (userProfile) {
        await calendarService.delete(userId, userId);

        for (let i = 0; i < userProfile.secondaryProfileIdList.length; i++) {
            try {
                const profile = await Profile.findById(secondaryProfiles[i]);
                // the profile may not have a calendar yet
                await calendarService.delete(userId, profile.id);
            } catch (e) {
                console.error(e);
            }
        }
        await userProfile.save()
    }
    await ProfileList.findOneAndDelete({userId: userId});
}
