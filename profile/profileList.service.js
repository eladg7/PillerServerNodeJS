const db = require('../_helpers/db');
const calendarService = require('../calendar/calendar.service');
const User = db.User;
const ProfileList = db.ProfileList;
const Profile = db.Profile;
const consts = require('../_helpers/consts');
const prepareResult = require('../_helpers/ResultPreparer');

module.exports = {
    getAllProfiles,
    addProfile,
    deleteAllProfiles,
    deleteProfile,
    initProfileList
};

async function initProfileList(userId) {
    let userProfile = await ProfileList.findOne({userId: userId});
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
        for (let i = 0; i < secondaryProfiles.length; i++) {
            const profile = await Profile.findById(secondaryProfiles[i]);
            allProfiles.push(prepareResult.prepareResult([consts.profile.profileId, profile.id],
                [consts.profile.profileName, profile.name], [consts.profile.profileRelation, profile.relation]));
        }
    }
    return prepareResult.prepareResult([consts.profile.profileList, allProfiles]);
}


async function addProfile(userId, profileBody) {
    const userProfile = await ProfileList.findOne({userId: userId});
    if (!userProfile) {
        throw consts.profile.profileDoesNotExistError;
    }
    const mainProfileId = (await User.findById(userId)).profileId;
    if (mainProfileId) {
        const mainProfileName = (await Profile.findById(mainProfileId)).name;
        const isProfileAlreadyInList = await isProfileNameExists(
            profileBody.name, userProfile.secondaryProfileIdList);
        if (isProfileAlreadyInList || mainProfileName === profileBody.name) {
            // exists in list
            throw consts.profile.profileAlreadyExistsError;
        }
    }

    const profile = new Profile({name: profileBody.name, relation: profileBody.relation});
    await profile.save();
    userProfile.secondaryProfileIdList.push(profile.id);
    await userProfile.save();

    return prepareResult.prepareResult([consts.profile.profileId, profile.id],
        [consts.profile.profileName, profileBody.name], [consts.profile.profileRelation, profileBody.relation]);
}

async function isProfileNameExists(profileName, secondaryProfiles) {
    let result = false;
    for (let i = 0; i < secondaryProfiles.length; i++) {
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
        for (let i = 0; i < userProfile.secondaryProfileIdList.length; i++) {
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
        for (let i = 0; i < userProfile.secondaryProfileIdList.length; i++) {
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
