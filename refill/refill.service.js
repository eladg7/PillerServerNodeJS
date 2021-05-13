const db = require('../_helpers/db');
const Refill = db.Refill;
const consts = require('../_helpers/consts');

module.exports = {
    decreasePillsLeft,
    increasePillsLeft
};


async function increasePillsLeft(refillId) {
    const refill = await Refill.findById(refillId);
    if (!refill) throw consts.refill.refillDoesntExistError;
    refill.pills_left++;
    await refill.save();
    return refill.pills_left;
}

async function decreasePillsLeft(refillId) {
    const refill = await Refill.findById(refillId);
    if (!refill) throw consts.refill.refillDoesntExistError;
    if (refill.pills_left > 0) {
        refill.pills_left--;
        await refill.save();
    }
    return refill.pills_left;
}
