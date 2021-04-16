const mongoose = require('mongoose');
const {Profile} = require("../_helpers/db");
const Schema = mongoose.Schema;

const schema = new Schema({
    userId: {type: String, unique: true, required: true},
    secondaryProfileList: [ {type: Profile, unique: true, required: true}]
});

schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        delete ret._id;
    }
});

module.exports = mongoose.model('ProfileList', schema);
