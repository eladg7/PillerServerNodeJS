const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    name: {type: String, required: true}
});

schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        delete ret._id;
    }
});

module.exports = mongoose.model('Profile', schema);
