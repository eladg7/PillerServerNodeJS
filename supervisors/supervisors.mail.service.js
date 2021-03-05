const jwt = require('jsonwebtoken');
const db = require('_helpers/db');
const consts = require('_helpers/consts');

const {getConfirmedSupervisors, getThreshold} = require("./supervisors.service");
const {getByEmailAndName} = require("../calendar/calendar.service");
const {getAllIntakes} = require("../intake_dates/intake_dates.service");
const sendMailHTML = require('_helpers/mailManager');

const User = db.User;

module.exports = {
    mailAllSupervisors
};

async function mailAllSupervisors() {
    await User.find({}).stream()
        .on('data', async function (user, err) {
            const threshold = (await getThreshold(user.email)).threshold;
            if (threshold > 0) {
                const supervisors = await getConfirmedSupervisors(user.email);
                const drugList = (await getByEmailAndName(user.email, user.name)).drug_info_list;
                await sendMailAboutUser(drugList, user, supervisors, threshold);
            }
        })
        .on('error', function (err) {
            console.log(err);
        })
        .on('end', function () {
            // final callback
        });
}

async function sendMailAboutUser(drugList, user, supervisors, threshold) {
    for (let i = 0; i < drugList.length; i++) {
        const intakes = await getAllIntakes(drugList[i].taken_id);

        //  sort the intakes by date
        intakes.sort(function (a, b) {
            return a.date - b.date;
        });

        //  get the last elements
        const lastThresholdElements = intakes.slice(Math.max(intakes.length - threshold, 0));
        if (hasConsecutiveNotTaken(lastThresholdElements)) {
            mailSupervisors(user, supervisors, drugList[i], threshold);
            mailUser(user, drugList[i], threshold);
        }
    }
}

function hasConsecutiveNotTaken(intakes) {
    let consecutive = true;
    for (let i = 0; i < intakes.length; i++) {
        if (intakes[i].isTaken) {
            consecutive = false;
            break;
        }
    }

    return consecutive;
}

function mailSupervisors(user, supervisors, drug, threshold) {
    for (let i = 0; i < supervisors.length; i++) {
        const unsubscribe_link = 'http://' + consts.serverConfig['IP'] + ':' + consts.serverConfig['PORT']
            + "/supervisors/unsubscribe/" + user.email + "/" + supervisors[i].supervisorEmail;
        const message = "<p>Hello " + supervisors[i].supervisorName + "!<br>" + user.name + " didn't take " + drug.name
            + " for the past " + threshold + " days." + "<br> To unsubscribe from being " + user.name
            + "'s supervisor, press " + "<a href=" + unsubscribe_link + ">here</a> </p>";
        sendMailHTML([supervisors[i].supervisorEmail], 'Piller - Supervisor Alert', message);
    }
}

function mailUser(user, drug, threshold) {
    const message = "<p>Hello " + user.name + "!<br>" + "It seems like you missed " + drug.name
        + " for the past " + threshold + " days. Remember to take your medicine and log it in Piller!";
    sendMailHTML([user.email], 'Piller - Missed Medicine', message);
}
