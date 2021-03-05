const config = require('config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('_helpers/db');
const sendMailHTML = require('_helpers/mailManager');
const consts = require('_helpers/consts');

const Supervisors = db.Supervisors;

module.exports = {
    getSupervisors,
    getConfirmedSupervisors,
    addSupervisor,
    deleteSupervisor,
    updateConfirmation,

    updateThreshold,
    getThreshold,

    deleteSupervisorList
};


async function getSupervisors(email) {
    let userSupervisors = await Supervisors.findOne({email: email});
    if (!userSupervisors) {
        userSupervisors = new Supervisors(
            {email: email, supervisorsList: [], missedDrugEvents: [], threshold: 3})
        await userSupervisors.save();
    }

    return {'supervisorsList': userSupervisors.supervisorsList};
}

async function getConfirmedSupervisors(email) {
    let userSupervisors = await Supervisors.findOne({email: email});
    var confirmedSupervisors = [];
    if (userSupervisors) {
        const allSupervisors = userSupervisors.supervisorsList;
        for (let i = 0; i < allSupervisors.length; i++) {
            if (allSupervisors[i].isConfirmed) {
                confirmedSupervisors.push(allSupervisors[i]);
            }
        }
    }

    return confirmedSupervisors;
}

// async function updateSupervisor(email, supervisorName, supervisorEmail) {
//
//     var userSupervisors = await Supervisors.findOne({email: email});
//     if (!userSupervisors) {
//         throw 'Supervisor list does not exist.'
//     }
//     const supervisors = userSupervisors.supervisorsList;
//     for (var i = 0; i < supervisors.length; i++) {
//         if (supervisors[i].supervisorEmail === supervisorEmail) {
//             supervisors[i].supervisorName = supervisorName;
//             supervisors[i].supervisorEmail = supervisorEmail
//             userSupervisors.save();
//             break;
//         }
//     }
// }

async function addSupervisor(email, supervisorName, supervisorEmail) {
    var userSupervisors = await Supervisors.findOne({email: email});
    if (!userSupervisors) {
        throw 'Supervisor list does not exist.';
    }
    const supervisors = userSupervisors.supervisorsList;
    for (var i = 0; i < supervisors.length; i++) {
        if (supervisors[i].supervisorEmail === supervisorEmail) {
            throw 'Supervisor already exists.';
        }
    }
    supervisors.push({'supervisorName': supervisorName, 'supervisorEmail': supervisorEmail, 'isConfirmed': false});
    userSupervisors.save();

    sendEmailConfirmation(email, supervisorName, supervisorEmail);
}

function sendEmailConfirmation(email, supervisorName, supervisorEmail) {
    const httpConfirmation = 'http://' + consts.serverConfig['IP'] + ':' + consts.serverConfig['PORT']
        + "/supervisors/confirmation/" + email + "/" + supervisorName + "/" + supervisorEmail;
    const message = "<p>Hello " + supervisorName + "!<br>" + "A Piller user with the email " + email +
        " has asked you to be his supervisor.<br>" +
        "<a href=" + httpConfirmation + ">Click here to confirm</a> </p>";
    sendMailHTML([supervisorEmail], 'Piller - Supervisor confirmation', message)
}

async function updateConfirmation(email, supervisorName, supervisorEmail) {
    var userSupervisors = await Supervisors.findOne({email: email});
    if (!userSupervisors) {
        throw 'Supervisor list does not exist.'
    }
    var found = false;
    const supervisors = userSupervisors.supervisorsList;
    for (var i = 0; i < supervisors.length; i++) {
        if (supervisors[i].supervisorEmail === supervisorEmail) {
            if (supervisors[i].isConfirmed) {
                // already was confirmed
                throw 'Supervisor has already been confirmed.'
            }
            supervisors[i].isConfirmed = true
            found = true
            break;
        }
    }
    if (found) {
        userSupervisors.save()
        return true;
    }
    throw 'Supervisor in not in user\'s list.'
}


async function deleteSupervisor(email, supervisorEmail) {
    var userSupervisors = await Supervisors.findOne({email: email});
    if (!userSupervisors) {
        throw 'Supervisor list does not exist.'
    }
    const supervisors = userSupervisors.supervisorsList;
    for (var i = 0; i < supervisors.length; i++) {
        if (supervisors[i].supervisorEmail === supervisorEmail) {
            supervisors.splice(i, 1);
            userSupervisors.save();
            break;
        }
    }
}

async function updateThreshold(email, threshHold) {
    var userSupervisors = await Supervisors.findOne({email: email});
    if (!userSupervisors) {
        throw 'Supervisors list does not exist.'
    }

    userSupervisors.threshold = threshHold;
    userSupervisors.save();
}

async function getThreshold(email) {
    const userSupervisors = await Supervisors.findOne({email: email});
    if (!userSupervisors) {
        throw 'Supervisors list does not exist.'
    }

    return {'threshold': userSupervisors.threshold}
}

async function deleteSupervisorList(email) {
    await Supervisors.deleteOne({email: email});
}
