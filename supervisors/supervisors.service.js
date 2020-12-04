const config = require('config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('_helpers/db');
const Supervisors = db.Supervisors;

module.exports = {
    getSupervisors,
    updateThreshold,
    getThreshold,
    addMissedCounterToDrug,
    deleteDrugCounter,
    deleteSupervisorList
};


async function getSupervisors(email) {

    var userSupervisors = await Supervisors.findOne({email: email});
    if (!userSupervisors) {
        userSupervisors = new Supervisors({email: email, missedDrugEvents: [], threshold: 3})
        await userSupervisors.save();
    }
    return userSupervisors.missedDrugEvents
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
    return userSupervisors.threshold
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

    return isNotify
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


