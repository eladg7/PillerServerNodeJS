const mongoose = require('mongoose');
const consts = require('../_helpers/consts');
const Schema = mongoose.Schema;

const schema = new Schema({
    name: {type: String, required: true},
    rxcui: {type: String, required: true},
    event_id: {type: String, required: true},
    taken_id: {type: String, required: true},
    refill_id: {type: String, required: true},
    dose_id: {type: String, required: true}
});

schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        delete ret._id;
    }
});

module.exports = mongoose.model(consts.drug.drugModelName, schema);
