const config = require('config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('_helpers/db');
const sendMailHTML = require('_helpers/mailManager');
const consts = require('_helpers/consts');

const Supervisors = db.Supervisors;
const Users = db.User;

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


async function getSupervisors(userId) {
    let userSupervisors = await Supervisors.findOne({userId: userId});
    if (!userSupervisors) {
        userSupervisors = new Supervisors(
            {userId: userId, supervisorsList: [], missedDrugEvents: [], threshold: 3})
        await userSupervisors.save();
    }

    return {'supervisorsList': userSupervisors.supervisorsList};
}

async function getConfirmedSupervisors(userId) {
    let userSupervisors = await Supervisors.findOne({userId: userId});
    const confirmedSupervisors = [];
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

async function addSupervisor(userId, supervisorName, supervisorEmail) {
    const userSupervisors = await Supervisors.findOne({userId: userId});
    if (!userSupervisors) {
        throw 'Supervisor list does not exist.';
    }
    const supervisors = userSupervisors.supervisorsList;
    for (let i = 0; i < supervisors.length; i++) {
        if (supervisors[i].supervisorEmail === supervisorEmail) {
            throw 'Supervisor already exists.';
        }
    }
    supervisors.push({'supervisorName': supervisorName, 'supervisorEmail': supervisorEmail, 'isConfirmed': false});
    await userSupervisors.save();
    const user = await Users.findById(userId);
    if (user) {
        sendEmailConfirmation(user, supervisorName, supervisorEmail);
    }
}

function sendEmailConfirmation(user, supervisorName, supervisorEmail) {
    const httpConfirmation = 'http://' + consts.serverConfig['IP'] + ':' + consts.serverConfig['PORT']
        + "/supervisors/confirmation/" + user.id + "/" + supervisorName + "/" + supervisorEmail;
    const message = "<p>Hello " + supervisorName + "!<br>" + "A Piller user with the email " + user.email +
        " has asked you to be his supervisor.<br>" +
        "<a href=" + httpConfirmation + ">Click here to confirm</a> </p>";
    sendMailHTML([supervisorEmail], 'Piller - Supervisor confirmation', message)
}

async function updateConfirmation(userId, supervisorName, supervisorEmail) {
    const userSupervisors = await Supervisors.findOne({userId: userId});
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
        await userSupervisors.save()
        return true;
    }
    throw 'Supervisor in not in user\'s list.'
}


async function deleteSupervisor(userId, supervisorEmail) {
    const userSupervisors = await Supervisors.findOne({userId: userId});
    if (!userSupervisors) {
        throw 'Supervisor list does not exist.'
    }
    const supervisors = userSupervisors.supervisorsList;
    for (var i = 0; i < supervisors.length; i++) {
        if (supervisors[i].supervisorEmail === supervisorEmail) {
            supervisors.splice(i, 1);
            await userSupervisors.save();
            break;
        }
    }
}

async function updateThreshold(userId, threshHold) {
    const userSupervisors = await Supervisors.findOne({userId: userId});
    if (!userSupervisors) {
        throw 'Supervisors list does not exist.'
    }

    userSupervisors.threshold = threshHold;
    await userSupervisors.save();
}

async function getThreshold(userId) {
    const userSupervisors = await Supervisors.findOne({userId: userId});
    if (!userSupervisors) {
        throw 'Supervisors list does not exist.'
    }

    return {'threshold': userSupervisors.threshold}
}

async function deleteSupervisorList(userId) {
    await Supervisors.deleteOne({userId: userId});
}
