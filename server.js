require('rootpath')();
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('_helpers/jwt');
const errorHandler = require('_helpers/error-handler');
const consts = require('_helpers/consts');
const cron = require('node-cron');
const {mailAllSupervisors} = require("./supervisors/supervisors.mail.service");

//  set limit to 25mb (so we will be able to receive images)
app.use(bodyParser.json({limit: consts.server.uploadLimit}));
app.use(bodyParser.urlencoded({limit: consts.server.uploadLimit, extended: true}));
app.use(cors());

// use JWT auth to secure the api
// app.use(jwt());

// api routes
app.use(consts.routes.user, require('./user/user.controller'));
app.use(consts.routes.calendar, require('./calendar/calendar.controller'));
app.use(consts.routes.profile, require('./profile/profileList.controller'));
app.use(consts.routes.supervisors, require('./supervisors/supervisors.controller'));
app.use(consts.routes.drugApiCalls, require('./drug_api_calls/drug_api_calls.controller'));
app.use(consts.routes.drugIntakes, require('./intake_dates/intake_dates.controller.'));
app.use(consts.routes.drugByBoxImage, require('./ocr/ocr.controller'));


// global error handler
app.use(errorHandler);

// start server
//const port = process.env.NODE_ENV === 'production' ? (process.env.PORT || 80) : serverConfig['PORT'];
const server = app.listen(consts.serverConfig.port, consts.serverConfig.IP, function () {
    console.log(consts.server.serverListening + consts.serverConfig.port);
    //  set a task every dat at 19:00:00 that will send an email to every supervisor if the user didn't take
    //  his medicine.
    //  explanation about the fields: https://www.npmjs.com/package/node-cron
    cron.schedule(consts.server.cronEmailTime, () => {
        mailAllSupervisors()
            .then()
            .catch(err => console.log(err));
    });
});
