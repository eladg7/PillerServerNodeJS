const db = require('_helpers/db');
const Calendar = db.Calendar;
const Occurrence = db.Occurrence;

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
    var calendar = await Calendar.findOne({email: email, name: name})

    if (!calendar) {
        calendar = new Calendar({email: email, name: name, drugList: []});
        await calendar.save();
    } else {
        const drugList = calendar.drugList;
        for (let i = 0; i < drugList.length; i++) {
            const drug = drugList[i].name;
            const rxcui = drugList[i].rxcui;
            const eventId = drugList[i].event_id;
            const drugInfo = await Occurrence.findById(eventId);
            drugInfoList.push({"name": drug, "rxcui": rxcui, "drug_info": drugInfo});
        }
    }
    return {"drug_info_list": drugInfoList};
}

async function deleteFutureOccurrencesOfDrugByUser(email, name, rxcui, repeat_end) {
    const calendar = await Calendar.findOne({email: email, name: name});
    if (!calendar) throw 'User\'s calendar not found';
    const drugList = calendar.drugList;
    for (let i = 0; i < drugList.length; i++) {
        if (drugList[i].rxcui === rxcui) {
            const event_id = drugList[i].event_id;
            const occurrence = await Occurrence.findById(event_id);
            occurrence.repeat_end = repeat_end;
            occurrence.save()
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
    const drugList = calendar.drugList;
    if(doesDrugExists(drugList,new_drug_info.rxcui)) throw 'Drug already exists in calendar.';
    await add_drug(calendar,new_drug_info)
}


function doesDrugExists(drugList,rxcui){
    var result=false;
    for(var i=0;i<drugList.length;i++){
        if(drugList[i].rxcui == rxcui){
            result=true;
            break;
        }
    }
    return result;
}

async function add_drug(calendar,new_drug_info){
    const occurrence = new Occurrence({
        repeat_start: new_drug_info.repeat_start, repeat_year: new_drug_info.repeat_year,
        repeat_month: new_drug_info.repeat_month, repeat_day: new_drug_info.repeat_day,
        repeat_week: new_drug_info.repeat_week, repeat_weekday: new_drug_info.repeat_weekday,
        repeat_end: new_drug_info.repeat_end
    });
    await occurrence.save();
    const event_id = await occurrence.id;
    const drug_name = new_drug_info.name;
    const drug_rxcui = new_drug_info.rxcui;
    var new_drug = {'name': drug_name, "rxcui": drug_rxcui, 'event_id': event_id}
    calendar.drugList.push(new_drug);
    await calendar.save();
}

async function update_drug(email, name, drug_info) {
    const calendar = await delete_drug(email, name, drug_info.rxcui);
    await add_drug(calendar, drug_info);
}

async function delete_drug(email, name, rxcui) {
    const calendar = await Calendar.findOne({email: email, name: name});
    if (!calendar) throw 'User\'s calendar not found';
    const drugList = calendar.drugList;
    for (let i = 0; i < drugList.length; i++) {
        if (drugList[i].rxcui == rxcui) { //has to be ==, not the same type
            const event_id = drugList[i].event_id;
            await Occurrence.findByIdAndDelete(event_id);
            drugList.splice(i, 1);
            break;
        }
    }
    await calendar.save();
    return calendar;
}

async function _delete(email) {
    const calendar = await Calendar.findOne({email: email, name: name});
    // validate
    if (!calendar) throw 'User\'s calendar not found';
    const drugList = calendar.drugList;

    // delete all occurances in calendar
    for (let i = 0; i < drugList.length; i++) {
        const event_id = drugList[i].event_id;
        await Occurrence.findByIdAndDelete(event_id);
    }

    await Calendar.deleteOne({email: email});
}
