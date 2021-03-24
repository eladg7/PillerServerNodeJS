const db = require('_helpers/db');
const {decreasePillsLeft,increasePillsLeft} = require("../refill/refill.service");

const IntakeDates = db.IntakeDates;

module.exports = {
    setIntake,
    getAllIntakes
};

async function setIntake(intake_id,refillId, date, taken) {
    const intakeDates = await IntakeDates.findById(intake_id);
    if (!intakeDates) throw 'Intake dates not found';
    let indexInArray = getElementIndex(intakeDates.intakes, date);
    if (indexInArray < 0) {
        intakeDates.intakes.push({date: date, isTaken: taken});
    } else {
        intakeDates.intakes[indexInArray].isTaken = taken;
    }
    await updatePillsLeft(taken,refillId);
    await intakeDates.save();
}


async function updatePillsLeft(taken,refillId){
    if(taken){
        await decreasePillsLeft(refillId);
    }else{
        await increasePillsLeft(refillId);
    }
}

function getElementIndex(array, valueToCheck) {
    let result = -1;
    for (let [index, entry] of array.entries()) {
        if (entry.date == valueToCheck) {
            result = index;
            break;
        }
    }
    return result;
}

async function getAllIntakes(intake_id) {
    const intakeDates = await IntakeDates.findById(intake_id);
    if (!intakeDates) throw 'Intake dates not found';
    return intakeDates.intakes;
}
