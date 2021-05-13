const assert = require('assert');
const consts = require('../_helpers/consts');
const db = require('../_helpers/db');
const Refill = db.Refill;
const prepareResult = require('../_helpers/ResultPreparer');


const {decreasePillsLeft, increasePillsLeft} = require("../refill/refill.service");

describe('refill.js tests', () => {
    describe('increasePillsLeft in refill Test', () => {
        it('increasePillsLeft in refill Test', async () => {
            const pillsLeft=20;
            const refillInfo = {is_to_notify: true,pills_left:pillsLeft,pills_before_reminder:2,reminder_time:"11:00"};
            let refill = new Refill(prepareResult.prepareResult(
                [consts.refill.isToNotify, refillInfo.is_to_notify], [consts.refill.pillsLeft, refillInfo.pills_left],
                [consts.refill.pillsBeforeReminder, refillInfo.pills_before_reminder], [consts.refill.reminderTime, refillInfo.reminder_time]));
            const refillID = await refill.save();

            let result= await increasePillsLeft(refillID);
            assert(result, pillsLeft+1);
            //check data in db
            refill = await Refill.findById(refillID);
            assert(refill[consts.refill.pillsLeft], pillsLeft+1);

            await Refill.findByIdAndDelete(refillID);

        });
    });

    describe('decreasePillsLeft in refill Test', () => {
        it('decreasePillsLeft in refill Test', async () => {
            const pillsLeft=0;
            const refillInfo = {is_to_notify: true,pills_left:pillsLeft,pills_before_reminder:2,reminder_time:"11:00"};
            let refill = new Refill(prepareResult.prepareResult(
                [consts.refill.isToNotify, refillInfo.is_to_notify], [consts.refill.pillsLeft, refillInfo.pills_left],
                [consts.refill.pillsBeforeReminder, refillInfo.pills_before_reminder], [consts.refill.reminderTime, refillInfo.reminder_time]));
            const refillID = await refill.save();

            let result= await decreasePillsLeft(refillID);
            assert(result===pillsLeft);
            //check data in db
            refill = await Refill.findById(refillID);
            assert(refill[consts.refill.pillsLeft]===pillsLeft);

            await Refill.findByIdAndDelete(refillID);
        });

        it('decreasePillsLeft in refill Test', async () => {
            const pillsLeft=2;
            const refillInfo = {is_to_notify: true,pills_left:pillsLeft,pills_before_reminder:2,reminder_time:"11:00"};
            let refill = new Refill(prepareResult.prepareResult(
                [consts.refill.isToNotify, refillInfo.is_to_notify], [consts.refill.pillsLeft, refillInfo.pills_left],
                [consts.refill.pillsBeforeReminder, refillInfo.pills_before_reminder], [consts.refill.reminderTime, refillInfo.reminder_time]));
            const refillID = await refill.save();

            let result= await decreasePillsLeft(refillID);
            assert(result, pillsLeft-1);
            //check data in db
            refill = await Refill.findById(refillID);
            assert(refill[consts.refill.pillsLeft], pillsLeft-1);

            await Refill.findByIdAndDelete(refillID);
        });
    });


});