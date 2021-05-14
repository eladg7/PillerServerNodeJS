const assert = require('assert');
const consts = require('../_helpers/consts');
const db = require('../_helpers/db');
const ProfileList = db.ProfileList;
const {authenticate, createNewUser, deleteUser} = require("../user/user.service");
const profileService = require("../profile/profileList.service");

let email = "PillerTestEmail", password = "PillerTestEmail", mainProfileName = "PillerTestName", userID;
let newProfile = {name: 'PillerSecondProfile', relation: 'TestRelation'};

async function registerUserAndUpdateUserId() {
    await createNewUser({email: email, password: password, mainProfileName: mainProfileName});
    const result = await authenticate({email: email, password: password});
    userID = result[consts.user.id];
    return result;
}

describe('profile.js tests', () => {
    describe('get all profiles Test', () => {
        it('get all profiles Test', async () => {
            await registerUserAndUpdateUserId();
            let allProfiles = await profileService.getAllProfiles(userID);
            assert(allProfiles.profile_list[0].name === mainProfileName);
            await deleteUser(userID, {password: password});
        });
    });

    describe('add profile Test', () => {
        it('add profile Test', async () => {
            let result = await registerUserAndUpdateUserId();
            await profileService.addProfile(userID, newProfile);
            let allProfiles = await profileService.getAllProfiles(userID);
            assert(allProfiles.profile_list[1].name === newProfile.name);
            assert(allProfiles.profile_list[1].relation === newProfile.relation);
            await deleteUser(userID, {password: password});
        });
    });

    describe('delete all profiles Test', () => {
        it('delete all profiles Test', async () => {
            let result = await registerUserAndUpdateUserId();
            await profileService.deleteAllProfiles(userID);
            let deletedProfile = ProfileList.findById(result[consts.user.profileId]);
            assert(deletedProfile.name === undefined);
            await deleteUser(userID, {password: password});
        });
    });

    describe('delete profile Test', () => {
        it('delete profile Test', async () => {
            let result = await registerUserAndUpdateUserId();
            let newProfileWithId = await profileService.addProfile(userID, newProfile);
            await profileService.deleteProfile(userID, newProfileWithId[consts.profile.profileId]);
            let deletedProfile = ProfileList.findById(newProfileWithId[consts.user.profileId]);
            assert(deletedProfile.name === undefined);
            await deleteUser(userID, {password: password});
        });
    });
});
