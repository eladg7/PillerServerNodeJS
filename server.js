require('rootpath')();
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('_helpers/jwt');
const errorHandler = require('_helpers/error-handler');
const consts = require('_helpers/consts');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cors());

// use JWT auth to secure the api
// app.use(jwt());

// api routes
app.use('/user', require('./user/user.controller'));
app.use('/calendar', require('./calendar/calendar.controller'));
app.use('/profile', require('./profile/profile.controller'));
app.use('/supervisors', require('./supervisors/supervisors.controller'));
app.use('/drugApiCalls', require('./drug_api_calls/drug_api_calls.controller'));
app.use('/drugIntakes', require('./intake_dates/intake_dates.controller.'));


// global error handler
app.use(errorHandler);

// start server
//const port = process.env.NODE_ENV === 'production' ? (process.env.PORT || 80) : serverConfig['PORT'];
const port = consts.serverConfig['PORT'];
const server = app.listen(port, consts.serverConfig['IP'], function () {
    console.log('Server listening on port ' + port);
});
