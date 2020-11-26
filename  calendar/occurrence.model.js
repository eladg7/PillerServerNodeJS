const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    repeat_start: {type: String, required: true,default:Date.now},
    repeat_year:{type: String,default:"-1"},
    repeat_month:{type: String,default:"-1"},
    repeat_day:{type: String,default:"-1"},
    repeat_week:{type: String,default:"-1"},
    repeat_weekday:{type: String,default:"-1"}
});

schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        delete ret._id;
    }
});

module.exports = mongoose.model('Occurrence', schema);
