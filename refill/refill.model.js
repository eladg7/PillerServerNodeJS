const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const consts = require('_helpers/consts');

const schema = new Schema({
    is_to_notify: {type: Boolean, required: true, default: consts.refill.defaultIsToNotify},
    pills_left: {type: Number, default: consts.refill.defaultPillsLeft},
    pills_before_reminder: {type: Number, default: consts.refill.defaultPillsBeforeReminder},
    reminder_time: {type: String, default: consts.refill.defaultReminderTime}


});

schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        delete ret._id;
    }
});

module.exports = mongoose.model(consts.refill.refillModelName, schema);
