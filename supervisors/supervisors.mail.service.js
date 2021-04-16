const jwt = require('jsonwebtoken');
const db = require('_helpers/db');
const consts = require('_helpers/consts');

const {getConfirmedSupervisors, getThreshold} = require("./supervisors.service");
const {getSpecificCalendar} = require("../calendar/calendar.service");
const {getAllIntakes} = require("../intake_dates/intake_dates.service");
const sendMailHTML = require('_helpers/mailManager');

const User = db.User;

module.exports = {
    mailAllSupervisors
};

async function mailAllSupervisors() {
    //  get every user
    await User.find({}).stream()
        .on('data', async function (user, _) {
            const threshold = (await getThreshold(user.id)).threshold;
            if (threshold > 0) {
                const supervisors = await getConfirmedSupervisors(user.id);
                const drugList = (await getSpecificCalendar(user.id, user.id)).drug_info_list;
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
        let intakes = await getAllIntakes(drugList[i].taken_id);

        intakes = getRelevantDates(intakes);
        //  get the last elements
        const lastThresholdElements = intakes.slice(Math.max(intakes.length - threshold, 0));
        if (hasConsecutiveNotTaken(lastThresholdElements)) {
            await mailSupervisors(user, supervisors, drugList[i], threshold);
            mailUser(user, drugList[i], threshold);
        }
    }
}

function getRelevantDates(intakes) {
    //  sort the intakes by date
    intakes.sort(function (a, b) {
        return a.date - b.date;
    });

    const now = new Date().getTime();
    //  leave only dates that are before now
    return intakes.filter(intake => intake.date <= now);
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

async function mailSupervisors(user, supervisors, drug, threshold) {
    for (let i = 0; i < supervisors.length; i++) {
        const unsubscribe_link = 'http://' + consts.serverConfig['IP'] + ':' + consts.serverConfig['PORT']
            + "/supervisors/unsubscribe/" + user.id + "/" + supervisors[i].supervisorEmail;
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
