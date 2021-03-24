const db = require('_helpers/db');
const {getAllIntakes} = require("../intake_dates/intake_dates.service");
const Calendar = db.Calendar;
const Occurrence = db.Occurrence;
const IntakeDates = db.IntakeDates;
const Dose = db.Dose;


module.exports = {
    getByEmailAndName,
    add_new_drug,
    delete_drug,
    update_drug,
    deleteFutureOccurrencesOfDrugByUser,
    delete: _delete
};

async function getByEmailAndName(email, name) {
    const drugInfoList = [];
    // const user = await User.findOne({email: email});
    // // validate
    // if (!user) throw 'User ' + email + ' not found';
    let calendar = await Calendar.findOne({email: email, name: name});

    if (!calendar) {
        calendar = new Calendar({email: email, name: name, drugList: []});
        await calendar.save();
    } else {
        const drugList = calendar.drugList;
        for (let i = 0; i < drugList.length; i++) {
            const drugObject = await getDrugObjectValues(drugList[i])
            drugInfoList.push({
                "drug_id": drugList[i].id,
                "name": drugList[i].name,
                "rxcui": drugList[i].rxcui,
                "occurrence": drugObject["occurrence"],
                "intake_dates": drugObject["intake_dates"],
                "dose": drugObject["dose"]
            });
        }
    }
    const calendarId = await calendar.id;
    return {"calendar_id": calendarId, "drug_info_list": drugInfoList};
}

async function getDrugObjectValues(drugObject) {
    const eventId = drugObject.event_id;
    const drugInfo = await Occurrence.findById(eventId);

    const takenId = drugObject.taken_id;
    const intakes = await getAllIntakes(takenId);

    const doseId = drugObject.dose_id;
    const doseInfo = await Dose.findById(doseId);

    return {
        "occurrence": {"event_id": eventId, "drug_info": drugInfo},
        "intake_dates": {"taken_id": takenId, "intakes": intakes},
        "dose": {"dose_id": doseId, "dose_info": doseInfo}
    };
}

async function deleteFutureOccurrencesOfDrugByUser(email, name, drug_id, repeat_end) {
    const calendar = await Calendar.findOne({email: email, name: name});
    if (!calendar) throw 'User\'s calendar not found';
    const drugList = calendar.drugList;
    for (let i = 0; i < drugList.length; i++) {
        if (drugList[i].id === drug_id) {
            const occurrence = await Occurrence.findById(drugList[i].event_id);
            //  if the repeat end is before repeat start then just delete the drug
            const repeatEndAsInt = parseInt(repeat_end);
            if (repeatEndAsInt !== 0 && (repeatEndAsInt <= parseInt(occurrence.repeat_start))) {
                await delete_drug(email, name, drug_id);
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
async function add_new_drug(email, profileName, new_drug_info) {
    const calendar = await Calendar.findOne({email: email, name: profileName});
    if (!calendar) throw 'User\'s calendar not found';
    //const drugList = calendar.drugList;
    //if (doesDrugExists(drugList, new_drug_info.rxcui)) throw 'Drug already exists in calendar.';
    return await add_drug(calendar, new_drug_info);
}


// function doesDrugExists(drugList, rxcui, drug_name) {
//     let result = false;
//     for (let i = 0; i < drugList.length; i++) {
//         if (drugList[i].rxcui == rxcui && drug_name === drugList[i].name) {
//             result = true;
//             break;
//         }
//     }
//     return result;
// }

async function add_drug(calendar, new_drug_info) {
    const drug_name = new_drug_info.name;
    const drug_rxcui = new_drug_info.rxcui;

    const event_id = await createOccurForDrug(new_drug_info);
    const taken_id = await createIntakeDatesForDrug(new_drug_info);
    const dose_id = await createDoseForDrug(new_drug_info);

    const new_drug = {
        'name': drug_name, "rxcui": drug_rxcui,
        'event_id': event_id, 'taken_id': taken_id, 'dose_id': dose_id
    };

    calendar.drugList.push(new_drug);
    await calendar.save();
    const newDrugId = calendar.drugList[calendar.drugList.length - 1].id;
    return {drug_id: newDrugId, event_id: event_id, taken_id: taken_id, dose_id: dose_id};
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

async function update_drug(email, name, drug_id, drug_info) {
    const calendar = await delete_drug(email, name, drug_id, true);
    return await add_drug(calendar, drug_info);
}

async function delete_drug(email, name, drug_id, returnCalendar = false) {
    const calendar = await Calendar.findOne({email: email, name: name});
    if (!calendar) throw 'User\'s calendar not found';
    const drugList = calendar.drugList;
    for (let i = 0; i < drugList.length; i++) {
        if (drugList[i].id === drug_id) { //has to be ==, not the same type
            await deleteAllInsideDrug(drugList[i]);
            drugList.splice(i, 1);
            break;
        }
    }
    await calendar.save();

    if (returnCalendar) {
        return calendar;
    }
}

async function _delete(email, name) {
    const calendar = await Calendar.findOne({email: email, name: name});
    // validate
    if (!calendar) throw 'User\'s calendar not found';
    const drugList = calendar.drugList;

    // delete all occurrences in calendar
    for (let i = 0; i < drugList.length; i++) {
        await deleteAllInsideDrug(drugList[i]);
    }

    await Calendar.deleteOne({email: email, name: name});
}


async function deleteAllInsideDrug(drugObject) {
    await Occurrence.findByIdAndDelete(drugObject.event_id);
    await IntakeDates.findByIdAndDelete(drugObject.taken_id);
    await Dose.findByIdAndDelete(drugObject.dose_id);
}
