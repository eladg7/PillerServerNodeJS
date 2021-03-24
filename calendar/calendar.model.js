const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    email: {type: String, required: true},
    name: {type: String, required: true},
    drugList: [{
        'name': {type: String, required: true},
        'rxcui': {type: String, required: true},
        'event_id': {type: String, required: true},
        'taken_id': {type: String, required: true},
        'dose_id': {type: String, required: true},
        'refill_id': {type: String, required: true}
    }]
});
schema.index({email: 1, name: 1}, {unique: true});
schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        delete ret._id;
    }
});

module.exports = mongoose.model('Calendar', schema);
