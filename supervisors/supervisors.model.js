const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const consts = require('_helpers/consts');

const schema = new Schema({
    userId: {type: String, unique: true, required: true},
    supervisorsList: [{'supervisorName': String, 'supervisorEmail': String, 'isConfirmed': Boolean}],
    threshold: {type: Number, required: true}
});

schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        delete ret._id;
    }
});

module.exports = mongoose.model(consts.supervisors.supervisorsModelName, schema);
