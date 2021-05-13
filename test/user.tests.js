const assert = require('assert');
const consts = require('../_helpers/consts');
const db = require('../_helpers/db');
const User = db.User;
const Calendar = db.Calendar;
const ProfileList = db.ProfileList;


const {authenticate, createNewUser, updateEmailUsernamePassword, deleteUser} = require("../user/user.service");
let email = "PillerTestEmail", emailUpdated = "PillerTestEmailUpdated", password = "PillerTestEmail",
    wrongPassword = "PillerTestEmailW" ,passwordUpdated = "PillerTestEmailUpdated",
    mainProfileName = "PillerTestName", mainProfileNameUpdated = "PillerTestNameUpdated", userID;

describe('user.js tests', () => {
    describe('add user Test', () => {
        it('add new user Test', async () => {
            await createNewUser({email: email, password: password, mainProfileName: mainProfileName})
            const result = await authenticate({email: email, password: password});
            userID = result[consts.user.id];
            assert(result[consts.user.email], email);
        });
    });
    describe('update user Test', () => {
        it('update user Test', async () => {
            await updateEmailUsernamePassword(userID, {
                email: emailUpdated, oldPassword: password,
                password: passwordUpdated, mainProfileName: mainProfileNameUpdated
            });
            const result = await authenticate({email: emailUpdated, password: passwordUpdated});
            assert(result[consts.user.email], emailUpdated);
            assert(result[consts.user.profileName], mainProfileNameUpdated);
        });

        it('update user Test with wrong password', async () => {
            let isSucceded=true;
            try{
                await updateEmailUsernamePassword(userID, {
                    email: emailUpdated, oldPassword: wrongPassword,
                    password: passwordUpdated, mainProfileName: mainProfileNameUpdated
                });
            }catch(e){
                isSucceded=false;
            }
            assert(isSucceded===false);
        });
    });

    describe('delete user Test', () => {
        it('delete user Test', async () => {
            await deleteUser(userID, {password: passwordUpdated})
            //delete from user db
            let result = await User.findById(userID);
            assert(result == null);
            //delete from profilelist db
            result = await ProfileList.findOne({userId: userID});
            assert(result == null);
            //delete from calendar db
            result = await Calendar.findOne({userId: userID});
            assert(result == null);
        });
    });

});