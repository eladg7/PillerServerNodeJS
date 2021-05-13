const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const consts = require('../_helpers/consts');

const schema = new Schema({
    userId: {type: String, required: true},
    profileId: {type: String, required: true},
    drugList: [{type: String, required: true}] //drugid's
});
//  set BOTH userid and profileid as the key
schema.index({userId: 1, profileId: 1}, {unique: true});
schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        delete ret._id;
    }
});

module.exports = mongoose.model(consts.calendar.calendarModelName, schema);
