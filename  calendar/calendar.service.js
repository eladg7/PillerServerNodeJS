const db = require('_helpers/db');
const Calendar = db.Calendar;

module.exports = {
    getByEmailAndName,
    update,
    delete: _delete
};

async function getByEmailAndName(email,name){
    var calendar = await Calendar.findOne({email: email, name: name})
    if( !calendar){
       calendar= new Calendar({email:email,name:name,drugList:[]});
       await calendar.save();
    }
    return calendar;
}

/*
{
    email:
    name:
    update_status:
    drug_info: {drug: ,time_intake: ,date: }
 */
async function update(email,name, userParam) {
    const calendar = await Calendar.findOne({email:email, name: name});

    // validate
    if (!calendar) throw 'User\'s calendar not found';

    var update_stat= userParam.update_status;
    var drug_info= userParam.drug_info;
    switch(update_stat){
        case 'add':
            drugList=calendar.drugList;
            drugList.push(drug_info);
            break;
        case 'update':
            update_drug(calendar,drug_info);
            break;
        case 'delete':
            delete_drug(calendar,drug_info);
            break;
    }

    await calendar.save();
}

async function update_drug(calendar,drug_info) {
    var drugList=calendar.drugList;
    for(var i=0;i<drugList.length;i++){
        if(drugList[i].drug === drug_info.drug){
            drugList.splice(i,1);
            drugList.push(drug_info);
        }
    }

}

async function delete_drug(calendar,drug_info) {
    var drugList=calendar.drugList;
    for(var i=0;i<drugList.length;i++){
        if(drugList[i].drug === drug_info.drug){
            drugList.splice(i,1);

        }
    }

}

async function _delete(email) {
    await User.deleteOne({email: email});
}
