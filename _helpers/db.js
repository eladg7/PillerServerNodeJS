const config = require('config.json');
const mongoose = require('mongoose');
const connectionOptions = {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
};
mongoose.connect(process.env.MONGODB_URI || config.connectionString, connectionOptions);
mongoose.Promise = global.Promise;

module.exports = {
    User: require('../user/user.model'),
    Calendar: require('../calendar/calendar.model'),
    Occurrence: require('../calendar/occurrence.model'),
    Profile: require('../profile/profile.model'),
    Supervisors: require('../supervisors/supervisors.model'),
    IntakeDates: require('../intake_dates/intake_dates.model'),
    Dose: require('../dose/dose.model'),
    Refill: require('../refill/refill.model')


};
