const config = require('config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('_helpers/db');
const Profile = db.Profile;

module.exports = {
    getAllProfiles,
    addProfile,
    deleteAllProfiles,
    deleteProfile
};

async function getAllProfiles(email){
    var profileList = [];
    var userProfiles = await Profile.findOne({email: email})
    if (userProfiles) {
        const profiles = userProfiles.secondaryProfileList;
        for (var i = 0; i < profiles.length; i++) {
            const profile_name= profiles[i];
            profileList.push(profile_name);
        }
    }
    return {"profile_list":profileList};
}
/*
{
	"profile_name":"katya2"
}
 */
async function addProfile(email,userParams){
    var userProfiles = await Profile.findOne({email: email})
    if (!userProfiles) {
        userProfiles=new Profile({email: email, secondaryProfileList: []})
    }

    const newProfile=userParams.profile_name
    userProfiles.secondaryProfileList.push(newProfile)
    await userProfiles.save()

}


async function deleteProfile(email,name){
    var userProfiles = await Profile.findOne({email: email})
    if (userProfiles) {
        var profileList=userProfiles.secondaryProfileList
        for (var i = 0; i < profileList.length; i++) {
            if( profileList[i] === name){
                profileList.splice(i, 1);
                break;
            }
        }
        userProfiles.save()

    }
}

async function deleteAllProfiles(email){
    await Profile.deleteOne({email: email});
}