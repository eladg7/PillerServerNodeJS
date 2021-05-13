const assert = require('assert');
const consts = require('../_helpers/consts');
const db = require('../_helpers/db');
const Drug = db.Drug;
const {authenticate, createNewUser, deleteUser} = require("../user/user.service");
const calendarService = require("../calendar/calendar.service");

let email = "PillerTestEmail", password = "PillerTestEmail", mainProfileName = "PillerTestName",
    drugInfo = {
        calendar_id: "607aae8a20210e41ccf30ea8",
        dose: {
            dose_id: "",
            measurement_type: "pills",
            total_dose: 1
        },
        drug_id: "",
        name: "abacavir 600 MG \\/ lamivudine 300 MG Oral Tablet",
        occurrence: {
            event_id: "",
            repeat_day: 1,
            repeat_end: 0,
            repeat_month: 0,
            repeat_start: 1620124920000,
            repeat_week: 0,
            repeat_weekday: [
                0
            ],
            repeat_year: 0
        },
        refill: {
            is_to_notify: false,
            pills_before_reminder: 1,
            pills_left: 0,
            refill_id: "",
            reminder_time: "11:00"
        },
        rxcui: 602393,
        taken_id: ""
    },
    userID;

async function registerUserAndUpdateUserId() {
    await createNewUser({email: email, password: password, mainProfileName: mainProfileName});
    const result = await authenticate({email: email, password: password});
    userID = result[consts.user.id];
    return result;
}

describe('calendar.js tests', () => {
    describe('get specific calendar Test', () => {
        it('get specific calendar Test', async () => {
            let result = await registerUserAndUpdateUserId();
            let calendar = await calendarService.getSpecificCalendar(userID, result[consts.user.profileId]);
            assert(calendar);
            await deleteUser(userID, {password: password});
        });
    });

    describe('add drug Test', () => {
        it('add drug Test', async () => {
            let result = await registerUserAndUpdateUserId();
            await calendarService.getSpecificCalendar(userID, result[consts.user.profileId]);
            let newDrug = await calendarService.add_new_drug(userID, result[consts.user.profileId], drugInfo);
            assert(newDrug);
            await deleteUser(userID, {password: password});
        });
    });

    describe('delete drug Test', () => {
        it('delete drug Test', async () => {
            let result = await registerUserAndUpdateUserId();
            await calendarService.getSpecificCalendar(userID, result[consts.user.profileId]);
            let newDrug = await calendarService.add_new_drug(userID, result[consts.user.profileId], drugInfo);
            let newCal = await calendarService.delete_drug(userID, result[consts.user.profileId], newDrug.drug_id, true);
            assert(newCal.drugList.length === 0);
            await deleteUser(userID, {password: password});
        });
    });

    describe('update drug Test', () => {
        it('update drug Test', async () => {
            let result = await registerUserAndUpdateUserId();
            await calendarService.getSpecificCalendar(userID, result[consts.user.profileId]);
            let newDrug = await calendarService.add_new_drug(userID, result[consts.user.profileId], drugInfo);
            const newDrugName = 'testtest';
            drugInfo.name = newDrugName;
            let updatedDrugInfo = await calendarService.update_drug(userID, result[consts.user.profileId], newDrug.id, drugInfo);
            let updatedDrug = await Drug.findById(updatedDrugInfo.drug_id);
            assert(updatedDrug.name === newDrugName);
            await deleteUser(userID, {password: password});
        });
    });

    describe('delete future drug Test', () => {
        it('delete future drug Test', async () => {
            let result = await registerUserAndUpdateUserId();
            await calendarService.getSpecificCalendar(userID, result[consts.user.profileId]);
            let newDrug = await calendarService.add_new_drug(userID, result[consts.user.profileId], drugInfo);
            assert(calendarService.deleteFutureOccurrencesOfDrugByUser(userID, result[consts.user.profileId], newDrug.drug_id, "0"));
            await deleteUser(userID, {password: password});
        });
    });

    describe('delete calendar Test', () => {
        it('delete calendar Test', async () => {
            let result = await registerUserAndUpdateUserId();
            await calendarService.getSpecificCalendar(userID, result[consts.user.profileId]);
            assert(calendarService.delete(userID, result[consts.user.profileId]));
            await deleteUser(userID, {password: password});
        });
    });
});
