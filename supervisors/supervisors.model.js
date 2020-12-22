const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    email: {type: String,unique:true, required: true},
    supervisorsList:[{'supervisorName':String,'supervisorEmail':String, 'isConfirmed':Boolean}],
    threshold:{type:Number,required: true},
    missedDrugEvents: [{'drug': String, 'missedCounter': Number}]

});

schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        delete ret._id;
    }
});

module.exports = mongoose.model('Supervisors', schema);