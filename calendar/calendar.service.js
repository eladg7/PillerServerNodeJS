const db = require('_helpers/db');
const {getAllIntakes} = require("../intake_dates/intake_dates.service");
const Calendar = db.Calendar;
const Occurrence = db.Occurrence;
const IntakeDates = db.IntakeDates;
const User = db.User;


module.exports = {
    getByEmailAndName,
    add_new_drug,
    delete_drug,
    update_drug,
    deleteFutureOccurrencesOfDrugByUser,
    delete: _delete
};

async function getByEmailAndName(email, name) {
    var drugInfoList = [];
    // const user = await User.findOne({email: email});
    // // validate
    // if (!user) throw 'User ' + email + ' not found';
    var calendar = await Calendar.findOne({email: email, name: name})

    if (!calendar) {
        calendar = new Calendar({email: email, name: name, drugList: []});
        await calendar.save();
    } else {
        const drugList = calendar.drugList;
        for (let i = 0; i < drugList.length; i++) {
            const eventId = drugList[i].event_id;
            const drugInfo = await Occurrence.findById(eventId);
            const takenId = drugList[i].taken_id;
            const intakes = await getAllIntakes(takenId);


            drugInfoList.push({
                "name": drugList[i].name,
                "rxcui": drugList[i].rxcui,
                "occurrence": {"event_id": eventId, "drug_info": drugInfo},
                "intake_dates":{"taken_id": takenId, "intakes": intakes}
            });
        }
    }
    const calendarId=await calendar.id
    return {"calendar_id":calendarId,"drug_info_list": drugInfoList};
}

async function deleteFutureOccurrencesOfDrugByUser(email, name, event_id, repeat_end) {
    const calendar = await Calendar.findOne({email: email, name: name});
    if (!calendar) throw 'User\'s calendar not found';
    const drugList = calendar.drugList;
    for (let i = 0; i < drugList.length; i++) {
        if (drugList[i].event_id == event_id) {
            const occurrence = await Occurrence.findById(event_id);
            occurrence.repeat_end = repeat_end;
            occurrence.save();
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
    return await add_drug(calendar, new_drug_info)
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
    const occurrenceObj=new_drug_info.occurrence
    const occurrence = new Occurrence({
        repeat_start: occurrenceObj.repeat_start, repeat_year: occurrenceObj.repeat_year,
        repeat_month: occurrenceObj.repeat_month, repeat_day: occurrenceObj.repeat_day,
        repeat_week: occurrenceObj.repeat_week, repeat_weekday: occurrenceObj.repeat_weekday,
        repeat_end: occurrenceObj.repeat_end
    });
    await occurrence.save();
    const event_id = await occurrence.id;
    const drug_name = new_drug_info.name;
    const drug_rxcui = new_drug_info.rxcui;
    const taken = new IntakeDates();
    await taken.save();
    const taken_id = await taken.id;
    const new_drug = {'name': drug_name, "rxcui": drug_rxcui, 'event_id': event_id, 'taken_id': taken_id};
    calendar.drugList.push(new_drug);
    await calendar.save();
    return {event_id: event_id, taken_id: taken_id};
}

async function update_drug(email, name, event_id, drug_info) {
    const calendar = await delete_drug(email, name, event_id, true);
    return await add_drug(calendar, drug_info);
}

async function delete_drug(email, name, event_id, returnCalendar = false) {
    const calendar = await Calendar.findOne({email: email, name: name});
    if (!calendar) throw 'User\'s calendar not found';
    const drugList = calendar.drugList;
    for (let i = 0; i < drugList.length; i++) {
        if (drugList[i].event_id == event_id) { //has to be ==, not the same type
            await Occurrence.findByIdAndDelete(event_id);
            await IntakeDates.findByIdAndDelete(drugList[i].taken_id);
            drugList.splice(i, 1);
            break;
        }
    }
    await calendar.save();

    if (returnCalendar) {
        return calendar;
    }
}

async function _delete(email,name) {
    const calendar = await Calendar.findOne({email: email, name: name});
    // validate
    if (!calendar) throw 'User\'s calendar not found';
    const drugList = calendar.drugList;

    // delete all occurrences in calendar
    for (let i = 0; i < drugList.length; i++) {
        await Occurrence.findByIdAndDelete(drugList[i].event_id);
        await IntakeDates.findByIdAndDelete(drugList[i].taken_id);
    }

    await Calendar.deleteOne({email: email, name: name});
}
