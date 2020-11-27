const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    email: {type: String, required: true},
    secondaryProfileList:[String]

});

schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        delete ret._id;
    }
});

module.exports = mongoose.model('Profile', schema);
