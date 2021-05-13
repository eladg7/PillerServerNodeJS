const mongoose = require('mongoose');
const consts = require('../_helpers/consts');
const Schema = mongoose.Schema;

const schema = new Schema({
    measurement_type: {type: String, required: true, default: consts.dose.defaultMeasurementType},
    total_dose: {type: Number, default: consts.dose.defaultTotalDose}

});

schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        delete ret._id;
    }
});

module.exports = mongoose.model(consts.dose.doseModelName, schema);
