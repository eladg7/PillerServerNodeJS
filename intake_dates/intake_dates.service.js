const db = require('../_helpers/db');
const {decreasePillsLeft, increasePillsLeft} = require("../refill/refill.service");
const consts = require('../_helpers/consts');

const IntakeDates = db.IntakeDates;

module.exports = {
    setIntake,
    getAllIntakes
};

async function setIntake(intake_id, refillId, date, taken) {
    const intakeDates = await IntakeDates.findById(intake_id);
    if (!intakeDates) throw consts.intake.intakeNotFoundError;
    let indexInArray = getElementIndex(intakeDates.intakes, date);
    if (indexInArray < 0) {
        intakeDates.intakes.push({date: date, isTaken: taken});
    } else {
        intakeDates.intakes[indexInArray].isTaken = taken;
    }
    const pillsLeft = await updatePillsLeft(taken, refillId);
    await intakeDates.save();
    return pillsLeft;
}


async function updatePillsLeft(taken, refillId) {
    let pillsLeft;
    if (taken) {
        pillsLeft = await decreasePillsLeft(refillId);
    } else {
        pillsLeft = await increasePillsLeft(refillId);
    }
    return pillsLeft
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
    if (!intakeDates) throw consts.intake.intakeNotFoundError;
    return intakeDates.intakes;
}
