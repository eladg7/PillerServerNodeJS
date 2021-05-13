const assert = require('assert');
const consts = require('../_helpers/consts');
const db = require('../_helpers/db');
const UserService = require("../user/user.service");
const Supervisor = db.Supervisors;

const {
    addSupervisor, getSupervisors, updateConfirmation, deleteSupervisor,
    updateThreshold, getThreshold,deleteSupervisorList
} = require("../supervisors/supervisors.service");

let email = "PillerTestEmail", password = "PillerTestEmail", mainProfileName = "PillerTestName", userID;
let supervisorName = "PillerSupervisor", supervisorEmail = "PillerSupervisorEmail";

async function addUser(){
    await UserService.createNewUser({email: email, password: password, mainProfileName: mainProfileName});
    const result = await UserService.authenticate({email: email, password: password});
    userID = result[consts.user.id];
}

async function deleteUser(){
    await UserService.deleteUser(userID, {password: password});
}

describe('supervisor.js tests',  () => {
    describe('add supervisor Test', () => {
        it('add supervisor Test', async () => {
            await addUser();
            let result = await getSupervisors(userID);
            const newSupervisorList=result[consts.supervisors.supervisorsList];
            assert(newSupervisorList, []);

            await addSupervisor(userID, supervisorName, supervisorEmail);
            result =await getSupervisors(userID);
            const newSupervisor=result[consts.supervisors.supervisorsList][0];
            assert(newSupervisor.supervisorEmail, supervisorEmail);
            assert(newSupervisor.supervisorName, supervisorName);
            assert(newSupervisor.isConfirmed===false);
        });
    });

    describe('update confiramtion for supervisor Test', () => {
        it('update confiramtion for supervisor Test', async () => {
            await updateConfirmation(userID, supervisorName,supervisorEmail);
            const result =await getSupervisors(userID);
            const newSupervisor=result[consts.supervisors.supervisorsList][0];
            assert(newSupervisor.isConfirmed===true);
        });
    });

    describe('get threshold supervisor Test', () => {
        it('get threshold supervisor Test', async () => {
            const result =await getThreshold(userID);
            assert(result, consts.supervisors.defaultThreshold);

        });
    });

    describe('update threshold supervisor Test', () => {
        it('update threshold supervisor Test', async () => {
            const newThreshold=10;
            await updateThreshold(userID,newThreshold);
            const result =await getThreshold(userID);
            assert(result, newThreshold);
        });
    });

    describe('delete supervisor Test', () => {
        it('delete supervisor Test', async () => {
            let isDeleted = await deleteSupervisor(userID,supervisorEmail);
            assert(isDeleted === true);

        });
    });

    describe('delete all supervisor Test', () => {
        it('delete all supervisor Test', async () => {
            await deleteSupervisorList(userID,supervisorEmail);
            let result = await Supervisor.findOne({userId: userID});
            assert(result == null);
            await deleteUser();
        });
    });


});