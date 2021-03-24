const db = require('_helpers/db');
const Refill = db.Refill;

module.exports = {
    decreasePillsLeft,
    increasePillsLeft
};


async function  increasePillsLeft(refillId){
     const refill=await Refill.findById(refillId);
     if(!refill) throw 'Refill id does not exists';
     refill.pills_left++;
     refill.save();
     return refill.pills_left;
}

async function  decreasePillsLeft(refillId){
    const refill=await Refill.findById(refillId);
    if(!refill) throw 'Refill id does not exists';
    if(refill.pills_left > 0){
        refill.pills_left--;
        refill.save();
    }
    return refill.pills_left;
}