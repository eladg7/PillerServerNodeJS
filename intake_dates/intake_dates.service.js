const db = require('_helpers/db');
const IntakeDates = db.IntakeDates;

module.exports = {
    addIntake,
    removeIntake,
    getAllIntakes
};

async function addIntake(intake_id, date) {
    const intakeDates = await IntakeDates.findById(intake_id);
    if (!intakeDates) throw 'Intake dates not found';
    if (!isInArray(intakeDates.taken, date)) {
        intakeDates.taken.push(date);
        await intakeDates.save();
    }
}

function isInArray(array, value) {
    let result = false;
    for (index in array) {
        if (array[index] == value) {
            result = true;
            break;
        }
    }
    return result;
}

async function removeIntake(intake_id, date) {
    const intakeDates = await IntakeDates.findById(intake_id);
    if (!intakeDates) throw 'Intake dates not found';
    let intakes = intakeDates.taken;
    for (let i = 0; i < intakes.length; i++) {
        if (intakes[i] == date) { //has to be ==, not the same type
            intakes.splice(i, 1);
            break;
        }
    }
    await intakeDates.save();
}

async function getAllIntakes(intake_id) {
    const intakeDates = await IntakeDates.findById(intake_id);
    if (!intakeDates) throw 'Intake dates not found';
    return intakeDates.taken;
}
