const db = require('_helpers/db');
const Calendar = db.Calendar;
const Occurrence = db.Occurrence;

module.exports = {
    getByEmailAndName,
    add_drug,
    delete_drug,
    update_drug,
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


/*
{
    "name":"acamol",
    "rxcui":12345,
    "repeat_start":"1606302569494",
    "repeat_year":-1,
    "repeat_month":-1,
    "repeat_day":-1,
    "repeat_week":-1,
    "repeat_weekday":2
}
 */

async function add_drug(email, name, new_drug_info) {
    const calendar = await Calendar.findOne({email: email, name: name});
    if (!calendar) throw 'User\'s calendar not found';
    const drugList = calendar.drugList;
    // const date = new Date(new_drug_info.date_intake + " " + new_drug_info.time_intake);
    // const seconds = date.getTime()
    const occurrence = new Occurrence({
        repeat_start: new_drug_info.repeat_start, repeat_year: new_drug_info.repeat_year,
        repeat_month: new_drug_info.repeat_month, repeat_day: new_drug_info.repeat_day,
        repeat_week: new_drug_info.repeat_week, repeat_weekday: new_drug_info.repeat_weekday
    });
    await occurrence.save();
    const event_id = await occurrence.id;
    const drug_name = new_drug_info.drug_name;
    const drug_rxcui = new_drug_info.rxcui;

    var new_drug = {'name': drug_name, "rxcui": drug_rxcui, 'event_id': event_id}
    drugList.push(new_drug);
    await calendar.save();
}

async function update_drug(email, name, userParam) {
    const calendar = await Calendar.findOne({email: email, name: name});
    if (!calendar) throw 'User\'s calendar not found';
    //  in order to update we just delete the original and then insert a new one
    await delete_drug(email, name, userParam);
    await add_drug(email, name, userParam);
}

async function delete_drug(email, name, userParam) {
    const calendar = await Calendar.findOne({email: email, name: name});
    if (!calendar) throw 'User\'s calendar not found';
    const new_drug_info = userParam.drug_info;
    const drugList = calendar.drugList;
    for (let i = 0; i < drugList.length; i++) {
        if (drugList[i].name === new_drug_info.name) {
            const event_id = drugList[i].event_id;
            await Occurrence.findByIdAndDelete(event_id);
            drugList.splice(i, 1);
            break;
        }
    }
    await calendar.save();
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
