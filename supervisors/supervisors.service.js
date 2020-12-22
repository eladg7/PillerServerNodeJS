const config = require('config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('_helpers/db');
const sendMailHTML = require('_helpers/mailManager');
const consts =require('_helpers/consts')

const Supervisors = db.Supervisors;

module.exports = {
    getSupervisors,
    addSupervisor,
    deleteSupervisor,
    updateConfirmation,

    updateThreshold,
    getThreshold,

    addMissedCounterToDrug,
    deleteDrugCounter,

    deleteSupervisorList
};


async function getSupervisors(email) {

    var userSupervisors = await Supervisors.findOne({email: email});
    if (!userSupervisors) {
        userSupervisors = new Supervisors(
            {email: email, supervisorsList: [], missedDrugEvents: [], threshold: 3})
        await userSupervisors.save();
    }
    return {'supervisorsList': userSupervisors.supervisorsList}
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
        throw 'Supervisor list does not exist.'
    }
    const supervisors = userSupervisors.supervisorsList;
    for (var i = 0; i < supervisors.length; i++) {
        if (supervisors[i].supervisorEmail === supervisorEmail) {
            throw 'Supervisor already exists.'
        }
    }
    supervisors.push({'supervisorName': supervisorName, 'supervisorEmail': supervisorEmail, 'isConfirmed': false});
    userSupervisors.save()

    sendEmailConfirmation(email,supervisorName,supervisorEmail)
}

function sendEmailConfirmation(email, supervisorName, supervisorEmail) {
    const httpConfirmation='http://'+consts.serverConfig['IP']+':'+ consts.serverConfig['PORT']
        +"/supervisors/confirmation/" + email+"/" + supervisorName+"/"+supervisorEmail;
    const message = "<p>Hello " + supervisorName + "!<br>" + "A Piller user with the email "+ email +
        " has asked you to be his supervisor.<br>" +
        "<a href=" + httpConfirmation +  ">Click here to confirm</a> </p>";
    sendMailHTML([supervisorEmail], 'Piller - Supervisor confirmation', message)
}

async function updateConfirmation(email, supervisorName, supervisorEmail){
    var userSupervisors = await Supervisors.findOne({email: email});
    if (!userSupervisors) {
        throw 'Supervisor list does not exist.'
    }
    var found=false;
    const supervisors = userSupervisors.supervisorsList;
    for (var i = 0; i < supervisors.length; i++) {
        if (supervisors[i].supervisorEmail === supervisorEmail) {
            if(supervisors[i].isConfirmed){
                // already was confirmed
                throw 'Supervisor has already been confirmed.'
            }
            supervisors[i].isConfirmed = true
            found=true
            break;
        }
    }
    if (found){
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

    var userSupervisors = await Supervisors.findOne({email: email});
    if (!userSupervisors) {
        throw 'Supervisors list does not exist.'
    }
    return {'threshold': userSupervisors.threshold}
}

async function addMissedCounterToDrug(email, drugName) {
    var isNotify = false;
    var isInList = false;
    var userSupervisors = await Supervisors.findOne({email: email});
    if (!userSupervisors) {
        throw 'Supervisors list does not exist.'
    }
    const threshHold = userSupervisors.threshold;
    const drugCounters = userSupervisors.missedDrugEvents;
    //check if drug is already in list, if so, update counter
    for (var i = 0; i < drugCounters.length; i++) {
        if (drugCounters[i].drug === drugName) {
            isInList = true;
            drugCounters[i].missedCounter++;
            if (drugCounters[i].missedCounter >= threshHold) {
                isNotify = true;
            }
            break;
        }
    }

    // if not in drug list, add with counter 1.
    if (!isInList) {
        drugCounters.push({'drug': drugName, 'missedCounter': 1});
        if (threshHold <= 1) {
            isNotify = true;
        }
    }
    userSupervisors.save();

    return {'isNotifySupervisors:': isNotify}
}


async function deleteDrugCounter(email, drugName) {

    var userSupervisors = await Supervisors.findOne({email: email});
    if (!userSupervisors) {
        throw 'Supervisors list does not exist.'
    }
    const drugCounters = userSupervisors.missedDrugEvents;
    //delete drug frm list
    for (var i = 0; i < drugCounters.length; i++) {
        if (drugCounters[i].drug === drugName) {
            drugCounters.splice(i, 1);
            break;
        }
    }
    userSupervisors.save();
}


async function deleteSupervisorList(email) {
    await Supervisors.deleteOne({email: email});

}


