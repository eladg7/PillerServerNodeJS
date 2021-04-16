const db = require('_helpers/db');
const {getAllIntakes} = require("../intake_dates/intake_dates.service");
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
    const calendarId = await calendar.id;
    return {"calendar_id": calendarId, "drug_info_list": drugInfoList};
}

async function getDrugObjectValues(drugId) {
    const drugObject= await Drug.findById(drugId);
    if(!drugObject) throw 'Drug id was not found in data base. Could not get drug Info.'

    const eventId = drugObject.event_id;
    const drugInfo = await Occurrence.findById(eventId);

    const takenId = drugObject.taken_id;
    const intakes = await getAllIntakes(takenId);

    const doseId = drugObject.dose_id;
    const doseInfo = await Dose.findById(doseId);

    const refillId = drugObject.refill_id;
    const refillInfo = await Refill.findById(refillId);


    return {
        "drug_id": drugId ,"name": drugObject.name, "rxcui":drugObject.rxcui,
        "occurrence": {"event_id": eventId, "drug_info": drugInfo},
        "intake_dates": {"taken_id": takenId, "intakes": intakes},
        "dose": {"dose_id": doseId, "dose_info": doseInfo},
        "refill": {"refill_id": refillId, "refill_info": refillInfo}
    };
}

async function deleteFutureOccurrencesOfDrugByUser(userId, profileId, drug_id, repeat_end) {
    const calendar = await Calendar.findOne({userId: userId, profileId: profileId});
    if (!calendar) throw 'User\'s calendar not found';
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
    if (!calendar) throw 'User\'s calendar not found';
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

    const drugId = await createDrug(drug_name,drug_rxcui,event_id,taken_id,dose_id,refill_id);

    calendar.drugList.push(drugId);
    await calendar.save();
    return {drug_id: drugId, event_id: event_id, taken_id: taken_id, dose_id: dose_id, refill_id: refill_id};
}

async function createDrug(drug_name,drug_rxcui,event_id,taken_id,dose_id,refill_id){
    const drug = new Drug({'name': drug_name, "rxcui": drug_rxcui,
        'event_id': event_id, 'taken_id': taken_id, 'refill_id': refill_id, 'dose_id': dose_id});
    await drug.save();
    return await drug.id;
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
    return await occurrence.id;
}

async function createIntakeDatesForDrug() {
    const taken = new IntakeDates();
    await taken.save();
    return await taken.id;
}

async function createDoseForDrug(new_drug_info) {
    const doseInfo = new_drug_info.dose;
    const dose = new Dose({'measurement_type': doseInfo.measurement_type, 'total_dose': doseInfo.total_dose});
    await dose.save();
    return await dose.id;
}

async function createRefillForDrug(new_drug_info) {
    const refillInfo = new_drug_info.refill;
    const refill = new Refill({
        'is_to_notify': refillInfo.is_to_notify, 'pills_left': refillInfo.pills_left,
        'pills_before_reminder': refillInfo.pills_before_reminder, 'reminder_time': refillInfo.reminder_time
    });
    await refill.save();
    return await refill.id;
}

async function update_drug(userId, profileId, drug_id, drug_info) {
    const calendar = await delete_drug(userId, profileId, drug_id, true);
    return await add_drug(calendar, drug_info);
}

async function delete_drug(userId, profileId, drug_id, returnCalendar = false) {
    const calendar = await Calendar.findOne({userId: userId, profileId: profileId});
    if (!calendar) throw 'User\'s calendar not found';
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
    if (!calendar) throw 'User\'s calendar not found';
    const drugList = calendar.drugList;

    // delete all occurrences in calendar
    for (let i = 0; i < drugList.length; i++) {
        await deleteAllDrugObject(drugList[i]);
    }

    await Calendar.deleteOne({userId: userId, profileId: profileId});
}


async function deleteAllDrugObject(drugId) {
    const drugObject= await Drug.findById(drugId);
    if(!drugObject) throw 'Could not delete drug, no such drug exists.'

    await Occurrence.findByIdAndDelete(drugObject.event_id);
    await IntakeDates.findByIdAndDelete(drugObject.taken_id);
    await Dose.findByIdAndDelete(drugObject.dose_id);
    await Refill.findByIdAndDelete(drugObject.refill_id);

    //last step delete drug
    await Drug.findByIdAndDelete(drugId);
}
