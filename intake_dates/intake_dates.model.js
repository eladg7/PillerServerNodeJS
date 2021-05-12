const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const consts = require('_helpers/consts');

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

module.exports = mongoose.model(consts.intake.modelName, schema);
