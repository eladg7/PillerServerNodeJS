const mongoose = require('mongoose');
const consts = require('../_helpers/consts');
const Schema = mongoose.Schema;

const schema = new Schema({
    repeat_start: {type: String, required: true, default: consts.occurrence.defaultRepeatStart},
    repeat_year: {type: Number, default: consts.occurrence.defaultRepeatYear},
    repeat_month: {type: Number, default: consts.occurrence.defaultRepeatMonth},
    repeat_day: {type: Number, default: consts.occurrence.defaultRepeatDay},
    repeat_week: {type: Number, default: consts.occurrence.defaultRepeatWeek},
    repeat_weekday: [{type: Number, default: consts.occurrence.defaultRepeatWeekday}],
    repeat_end: {type: String, default: consts.occurrence.defaultRepeatEnd}
});

schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        delete ret._id;
    }
});

module.exports = mongoose.model(consts.occurrence.occurrence, schema);
