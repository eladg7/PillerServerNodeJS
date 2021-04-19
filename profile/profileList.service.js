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
    const userProfile = await ProfileList.findOne({userId: userId});
    if (userProfile) {
        const secondaryProfiles = userProfile.secondaryProfileIdList;
        for (var i = 0; i < secondaryProfiles.length; i++) {
            const profile = await Profile.findById(secondaryProfiles[i]);
            allProfiles.push({"id": profile.id, "name": profile.name, "relation": profile.relation});
        }
    }
    return {"profile_list": allProfiles};
}


async function addProfile(userId, profileName, relation) {
    const userProfile = await ProfileList.findOne({userId: userId});
    if (!userProfile) {
        throw 'Profiles does not exist.';
    }
    const mainProfileId = (await User.findById(userId)).profileId;
    if (mainProfileId) {
        const mainProfileName = (await Profile.findById(mainProfileId)).name;
        const isProfileAlreadyInList = await isProfileNameExists(profileName, userProfile.secondaryProfileIdList);
        if (isProfileAlreadyInList || mainProfileName === profileName) {
            // exists in list
            throw 'Profile already exists.';
        }
    }

    const profile = new Profile({name: profileName,relation: relation});
    await profile.save();
    userProfile.secondaryProfileIdList.push(profile.id);
    await userProfile.save()

    return {"id": profile.id, "name": profileName, "relation": relation};
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
            const profile = await Profile.findById(userProfile.secondaryProfileIdList[i]);
            if (profile.id === profileId) {
                await Profile.findByIdAndDelete(profile.id);
                try {
                    // the profile may not have a calendar yet
                    await calendarService.delete(userId, profileId);
                } catch (e) {
                    console.error(e);
                }
                userProfile.secondaryProfileIdList.splice(i, 1);
                break;
            }
        }
        await userProfile.save();
    }
}

async function deleteAllProfiles(userId) {
    const userProfile = await ProfileList.findOne({userId: userId});
    if (userProfile) {
        for (var i = 0; i < userProfile.secondaryProfileIdList.length; i++) {
            const profile = await Profile.findById(userProfile.secondaryProfileIdList[i]);
            await Profile.findByIdAndDelete(profile.id);
            try {
                // the profile may not have a calendar yet
                await calendarService.delete(userId, profile.id);
            } catch (e) {
                console.error(e);
            }
        }
        await userProfile.save();
    }
    await ProfileList.findOneAndDelete({userId: userId});
}
