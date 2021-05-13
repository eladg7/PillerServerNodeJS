const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const consts = require('../_helpers/consts');

const schema = new Schema({
    profileId: {type: String, required: false},
    password: {type: String, required: false},
    email: {type: String, unique: true, required: true},
    createdDate: {type: Date, default: consts.user.defaultCreateDate}
});

schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        delete ret._id;
        delete ret.password;
    }
});

module.exports = mongoose.model(consts.user.userModelName, schema);
