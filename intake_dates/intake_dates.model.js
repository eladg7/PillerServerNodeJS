const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    taken: [{type: Number, required: true}]
});

schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        // delete ret._id;
    }
});

module.exports = mongoose.model('IntakeDates', schema);
