const assert = require('assert');
const consts = require('../_helpers/consts');
const db = require('../_helpers/db');
const Drug = db.Drug;
const {authenticate, createNewUser, deleteUser} = require("../user/user.service");
const intakeService = require("../intake_dates/intake_dates.service");
const {getAllIntakes} = require("../intake_dates/intake_dates.service");
const {add_new_drug, getSpecificCalendar} = require("../calendar/calendar.service");

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
            pills_left: 10,
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

describe('intake_dates.js tests', () => {
    describe('get all intakes Test', () => {
        it('get all intakes Test', async () => {
            let result = await registerUserAndUpdateUserId();
            await getSpecificCalendar(userID, result[consts.user.profileId]);
            let newDrug = await add_new_drug(userID, result[consts.user.profileId], drugInfo);
            let allIntakes = await getAllIntakes(newDrug.taken_id);
            assert(allIntakes);
            await deleteUser(userID, {password: password});
        });
    });

    describe('set intake taken Test', () => {
        it('set intake taken Test', async () => {
            let result = await registerUserAndUpdateUserId();
            await getSpecificCalendar(userID, result[consts.user.profileId]);
            let newDrug = await add_new_drug(userID, result[consts.user.profileId], drugInfo);
            let pillsLeft = await intakeService.setIntake(newDrug.taken_id, newDrug.refill_id, Date.now(), true);
            assert(pillsLeft === 9);
            await deleteUser(userID, {password: password});
        });
    });

    describe('set intake not taken Test', () => {
        it('set intake not taken Test', async () => {
            let result = await registerUserAndUpdateUserId();
            await getSpecificCalendar(userID, result[consts.user.profileId]);
            let newDrug = await add_new_drug(userID, result[consts.user.profileId], drugInfo);
            let pillsLeft = await intakeService.setIntake(newDrug.taken_id, newDrug.refill_id, Date.now(), false);
            assert(pillsLeft === 11);
            await deleteUser(userID, {password: password});
        });
    });
});
