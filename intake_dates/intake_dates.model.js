const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    intakes: [{date: {type: Number, required: true}, isTaken: {type: Boolean, required: true}}]
});

schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        // delete ret._id;
    }
});

module.exports = mongoose.model('IntakeDates', schema);
