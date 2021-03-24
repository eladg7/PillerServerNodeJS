const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    is_to_notify: {type: Boolean, required: true, default: false},
    pills_left: {type: Number, default: 0},
    pills_before_reminder:{type: Number, default: 1},
    reminder_time:{type: String,default: "00:00"}


});

schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        delete ret._id;
    }
});

module.exports = mongoose.model('Refill', schema);
