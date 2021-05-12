const db = require('_helpers/db');
const {getAllIntakes} = require("../intake_dates/intake_dates.service");
const consts = require('_helpers/consts');
const prepareResult = require('../_helpers/ResultPreparer');

const Calendar = db.Calendar;
const Occurrence = db.Occurrence;
const IntakeDates = db.IntakeDates;
const Dose = db.Dose;
const Refill = db.Refill;
const Drug = db.Drug;


module.exports = {
    getSpecificCalendar,
    add_new_drug,
    delete_drug,
    update_drug,
    deleteFutureOccurrencesOfDrugByUser,
    delete: _delete
};

async function getSpecificCalendar(userId, profileId) {
    const drugInfoList = [];
    let calendar = await Calendar.findOne({userId: userId, profileId: profileId});

    if (!calendar) {
        calendar = new Calendar({userId: userId, profileId: profileId, drugList: []});
        await calendar.save();
    } else {
        const drugList = calendar.drugList;
        for (let i = 0; i < drugList.length; i++) {
            const drugObject = await getDrugObjectValues(drugList[i])
            drugInfoList.push(drugObject);
        }
    }

    return prepareResult.prepareResult([consts.calendar.calendarId, calendar.id], [consts.drug.drugInfoList, drugInfoList]);
}

async function getDrugObjectValues(drugId) {
    const drugObject = await Drug.findById(drugId);
    if (!drugObject) throw consts.drug.cantGetDrugInfoError;

    const eventId = drugObject.event_id;
    const drugInfo = await Occurrence.findById(eventId);

    const takenId = drugObject.taken_id;
    const intakes = await getAllIntakes(takenId);

    const doseId = drugObject.dose_id;
    const doseInfo = await Dose.findById(doseId);

    const refillId = drugObject.refill_id;
    const refillInfo = await Refill.findById(refillId);

    let occurrenceData = {};
    occurrenceData[consts.occurrence.eventId] = eventId;
    occurrenceData[consts.drug.drugInfo] = drugInfo;
    let intakeData = {};
    intakeData[consts.intake.takenId] = takenId;
    intakeData[consts.intake.intakes] = intakes;
    let doseData = {};
    doseData[consts.dose.doseId] = doseId;
    doseData[consts.dose.doseInfo] = doseInfo;
    let refillData = {};
    refillData[consts.refill.refillId] = refillId;
    refillData[consts.refill.refillInfo] = refillInfo;
    return prepareResult.prepareResult(
        [consts.drug.drugId, drugId],
        [consts.drug.name, drugObject.name],
        [consts.drug.rxcui, drugObject.rxcui],
        [consts.occurrence.occurrence, occurrenceData],
        [consts.intake.intakeDates, intakeData],
        [consts.dose.dose, doseData],
        [consts.refill.refill, refillData]
    );
}

async function deleteFutureOccurrencesOfDrugByUser(userId, profileId, drug_id, repeat_end) {
    const calendar = await Calendar.findOne({userId: userId, profileId: profileId});
    if (!calendar) throw consts.calendar.calendarNotFound;
    const drugList = calendar.drugList;
    for (let i = 0; i < drugList.length; i++) {
        if (drugList[i].id === drug_id) {
            const occurrence = await Occurrence.findById(drugList[i].event_id);
            //  if the repeat end is before repeat start then just delete the drug
            const repeatEndAsInt = parseInt(repeat_end);
            if (repeatEndAsInt !== 0 && (repeatEndAsInt <= parseInt(occurrence.repeat_start))) {
                await delete_drug(userId, profileId, drug_id);
            } else {
                occurrence.repeat_end = repeat_end;
                await occurrence.save();
            }
            return true;
        }
    }
    return false;
}

/*
{
    "name":"acamol",
    "rxcui":12345,
    "repeat_start":"1606302569494",
    "repeat_year":0,
    "repeat_month":0,
    "repeat_day":0,
    "repeat_week":1,
    "repeat_weekday":2
}
 */
async function add_new_drug(userId, profileId, new_drug_info) {
    const calendar = await Calendar.findOne({userId: userId, profileId: profileId});
    if (!calendar) throw consts.calendar.calendarNotFound;
    //const drugList = calendar.drugList;
    //if (doesDrugExists(drugList, new_drug_info.rxcui)) throw 'Drug already exists in calendar.';
    return await add_drug(calendar, new_drug_info);
}

async function add_drug(calendar, new_drug_info) {
    const drug_name = new_drug_info.name;
    const drug_rxcui = new_drug_info.rxcui;
    const event_id = await createOccurForDrug(new_drug_info);
    const taken_id = await createIntakeDatesForDrug(new_drug_info);
    const dose_id = await createDoseForDrug(new_drug_info);
    const refill_id = await createRefillForDrug(new_drug_info);

    const drugId = await createDrug(drug_name, drug_rxcui, event_id, taken_id, dose_id, refill_id);

    calendar.drugList.push(drugId);
    await calendar.save();
    return {drug_id: drugId, event_id: event_id, taken_id: taken_id, dose_id: dose_id, refill_id: refill_id};
}

async function createDrug(drug_name, drug_rxcui, event_id, taken_id, dose_id, refill_id) {
    const drug = new Drug(prepareResult.prepareResult([consts.drug.name, drug_name], [consts.drug.rxcui, drug_rxcui],
        [consts.occurrence.eventId, event_id], [consts.intake.takenId, taken_id], [consts.refill.refillId, refill_id],
        [consts.dose.doseId, dose_id]));
    await drug.save();
    return drug.id;
}

async function createOccurForDrug(new_drug_info) {
    const occurrenceObj = new_drug_info.occurrence
    const occurrence = new Occurrence({
        repeat_start: occurrenceObj.repeat_start, repeat_year: occurrenceObj.repeat_year,
        repeat_month: occurrenceObj.repeat_month, repeat_day: occurrenceObj.repeat_day,
        repeat_week: occurrenceObj.repeat_week, repeat_weekday: occurrenceObj.repeat_weekday,
        repeat_end: occurrenceObj.repeat_end
    });
    await occurrence.save();
    return occurrence.id;
}

async function createIntakeDatesForDrug() {
    const taken = new IntakeDates();
    await taken.save();
    return taken.id;
}

async function createDoseForDrug(new_drug_info) {
    const doseInfo = new_drug_info.dose;
    const dose = new Dose(prepareResult.prepareResult(
        [consts.dose.measurementType, doseInfo.measurement_type],
        [consts.dose.totalDose, doseInfo.total_dose]));
    await dose.save();
    return dose.id;
}

async function createRefillForDrug(new_drug_info) {
    const refillInfo = new_drug_info.refill;
    const refill = new Refill(prepareResult.prepareResult(
        [consts.refill.isToNotify, refillInfo.is_to_notify], [consts.refill.pillsLeft, refillInfo.pills_left],
        [consts.refill.pillsBeforeReminder, refillInfo.pills_before_reminder], [consts.refill.reminderTime, refillInfo.reminder_time]));
    await refill.save();
    return refill.id;
}

async function update_drug(userId, profileId, drug_id, drug_info) {
    const calendar = await delete_drug(userId, profileId, drug_id, true);
    return await add_drug(calendar, drug_info);
}

async function delete_drug(userId, profileId, drug_id, returnCalendar = false) {
    const calendar = await Calendar.findOne({userId: userId, profileId: profileId});
    if (!calendar) throw consts.calendar.calendarNotFound;
    const drugList = calendar.drugList;
    for (let i = 0; i < drugList.length; i++) {
        if (drugList[i] === drug_id) {
            await deleteAllDrugObject(drugList[i]);
            drugList.splice(i, 1);
            break;
        }
    }
    await calendar.save();

    if (returnCalendar) {
        return calendar;
    }
}

async function _delete(userId, profileId) {
    const calendar = await Calendar.findOne({userId: userId, profileId: profileId});
    // validate
    if (!calendar) throw consts.calendar.calendarNotFound;
    const drugList = calendar.drugList;

    // delete all occurrences in calendar
    for (let i = 0; i < drugList.length; i++) {
        await deleteAllDrugObject(drugList[i]);
    }

    await Calendar.deleteOne({userId: userId, profileId: profileId});
}


async function deleteAllDrugObject(drugId) {
    const drugObject = await Drug.findById(drugId);
    if (!drugObject) throw consts.drug.cantDeleteDrugError;

    await Occurrence.findByIdAndDelete(drugObject.event_id);
    await IntakeDates.findByIdAndDelete(drugObject.taken_id);
    await Dose.findByIdAndDelete(drugObject.dose_id);
    await Refill.findByIdAndDelete(drugObject.refill_id);

    //last step delete drug
    await Drug.findByIdAndDelete(drugId);
}
