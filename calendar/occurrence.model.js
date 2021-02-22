const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    repeat_start: {type: String, required: true, default: Date.now},
    repeat_year: {type: Number, default: 0},
    repeat_month: {type: Number, default: 0},
    repeat_day: {type: Number, default: 0},
    repeat_week: {type: Number, default: 0},
    repeat_weekday: {type: String, default: "-1"},
    repeat_end: {type: String, default: "0"}
});

schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        delete ret._id;
    }
});

module.exports = mongoose.model('Occurrence', schema);
