const db = require('_helpers/db');
const Calendar = db.Calendar;
const Occurrence = db.Occurrence;

module.exports = {
    getByEmailAndName,
    update,
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
        for (var i = 0; i < drugList.length; i++) {
            const drug= drugList[i].drug;
            const eventId =  drugList[i].event_id;
            const drugInfo=await Occurrence.findById(eventId);
            drugInfoList.push({"drug":drug,"drug_info":drugInfo});
        }
    }
    return {"drug_info_list":drugInfoList};
}


/*
{
    "update_status":"add",
    "drug_info":{
        "drug":"acamol",
        "repeat_start":"1123240000",
        "repeat_year":null,
        "repeat_month":null,
        "repeat_day":null,
        "repeat_week":null,
        "repeat_weekday":2
    }
}
 */
async function update(email, name, userParam) {
    const calendar = await Calendar.findOne({email: email, name: name});
    // validate
    if (!calendar) throw 'User\'s calendar not found';

    var update_stat = userParam.update_status;
    var new_drug_info = userParam.drug_info;
    switch (update_stat) {
        case 'add':
            add_drug(calendar, new_drug_info);
            break;
        case 'update':
            update_drug(calendar, new_drug_info);
            break;
        case 'delete':
            delete_drug(calendar, new_drug_info);
            break;
    }


}

async function add_drug(calendar, new_drug_info) {
    var drugList = calendar.drugList;
    // const date = new Date(new_drug_info.date_intake + " " + new_drug_info.time_intake);
    // const seconds = date.getTime()
    const occurrence = new Occurrence({
        repeat_start: new_drug_info.repeat_start, repeat_year: new_drug_info.repeat_year,
        repeat_month: new_drug_info.repeat_month, repeat_day: new_drug_info.repeat_day,
        repeat_week: new_drug_info.repeat_week, repeat_weekday: new_drug_info.repeat_weekday
    });
    await occurrence.save();
    const event_id = await occurrence.id;
    const drug_name = new_drug_info.drug;

    var new_drug = {'drug': drug_name, 'event_id': event_id}
    drugList.push(new_drug);
    await calendar.save();

}

async function update_drug(calendar, new_drug_info) {
    var drugList = calendar.drugList;
    for (var i = 0; i < drugList.length; i++) {
        if (drugList[i].drug === new_drug_info.drug) {
            const event_id = drugList[i].event_id;
            await Occurrence.findByIdAndDelete(event_id);
            drugList.splice(i, 1);
            break;
        }
    }

    add_drug(calendar, new_drug_info);
}

async function delete_drug(calendar, new_drug_info) {
    var drugList = calendar.drugList;
    for (var i = 0; i < drugList.length; i++) {
        if (drugList[i].drug === new_drug_info.drug) {
            const event_id = drugList[i].event_id;
            await Occurrence.findByIdAndDelete(event_id);
            drugList.splice(i, 1);
            break;
        }
    }
    await calendar.save();
}

async function _delete(email) {
    await User.deleteOne({email: email});
}
