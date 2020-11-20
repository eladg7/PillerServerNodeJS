const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    repeat_start: {type: Number, required: true,default:Date.now},
    repeat_year:{type: Number,default:null},
    repeat_month:{type: Number,default:null},
    repeat_day:{type: Number,default:null},
    repeat_week:{type: Number,default:null},
    repeat_weekday:{type: Number,default:null}
});

schema.set('toJSON', {
    virtuals: true,
    versionKey: false

});

module.exports = mongoose.model('Occurrence', schema);
