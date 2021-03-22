const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    measurement_type: {type: String, required: true, default: "mg"},
    total_dose: {type: Number, default: 0}

});

schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        delete ret._id;
    }
});

module.exports = mongoose.model('Dose', schema);
