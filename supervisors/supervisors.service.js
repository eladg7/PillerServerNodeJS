const db = require('../_helpers/db');
const sendMailHTML = require('../_helpers/mailManager');
const consts = require('../_helpers/consts');
const User = db.User;
const Supervisors = db.Supervisors;
const prepareResult = require('../_helpers/ResultPreparer');

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
            {
                userId: userId,
                supervisorsList: [],
                missedDrugEvents: [],
                threshold: consts.supervisors.defaultThreshold
            });
        await userSupervisors.save();
    }

    return prepareResult.prepareResult([consts.supervisors.supervisorsList, userSupervisors.supervisorsList]);
}

async function getConfirmedSupervisors(userId) {
    let userSupervisors = await Supervisors.findOne({userId: userId});
    let confirmedSupervisors = [];
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

async function addSupervisor(userId, supervisorName, supervisorEmail) {
    let userSupervisors = await Supervisors.findOne({userId: userId});
    if (!userSupervisors) {
        throw consts.supervisors.supervisorListDoesNotExistError;
    }
    const supervisors = userSupervisors.supervisorsList;
    for (let i = 0; i < supervisors.length; i++) {
        if (supervisors[i].supervisorEmail === supervisorEmail) {
            throw consts.supervisors.supervisorAlreadyExistsError;
        }
    }
    supervisors.push(prepareResult.prepareResult([consts.supervisors.supervisorName, supervisorName],
        [consts.supervisors.supervisorEmail, supervisorEmail], [consts.supervisors.isConfirmed, false]));
    await userSupervisors.save();
    const email = (await User.findById(userId)).email;
    sendEmailConfirmation(userId, email, supervisorName, supervisorEmail);
}

function sendEmailConfirmation(userId, email, supervisorName, supervisorEmail) {
    const httpConfirmation = `http://${consts.serverConfig.IP}:${consts.serverConfig.port}`
        + `${consts.supervisors.subscribeLink}${userId}/${supervisorName}/${supervisorEmail}`;
    const message = `<p>Hello ${supervisorName}!<br>A Piller user with the email ${email}` +
        ` has asked you to be his supervisor.<br><a href=${httpConfirmation}>Click here to confirm</a></p>`;
    sendMailHTML([supervisorEmail], consts.supervisors.supervisorEmailTitle, message);
}

async function updateConfirmation(userId, supervisorName, supervisorEmail) {
    let userSupervisors = await Supervisors.findOne({userId: userId});
    if (!userSupervisors) {
        throw consts.supervisors.supervisorListDoesNotExistError;
    }
    let found = false;
    const supervisors = userSupervisors.supervisorsList;
    for (let i = 0; i < supervisors.length; i++) {
        if (supervisors[i].supervisorEmail === supervisorEmail) {
            if (supervisors[i].isConfirmed) {
                // already was confirmed
                throw consts.supervisors.supervisorAlreadyConfirmedError;
            }
            supervisors[i].isConfirmed = true;
            found = true;
            break;
        }
    }
    if (found) {
        await userSupervisors.save();
        return true;
    }
    throw consts.supervisors.supervisorNotInUserListError;
}


async function deleteSupervisor(userId, supervisorEmail) {
    let isDeleted=false;
    let userSupervisors = await Supervisors.findOne({userId: userId});
    if (!userSupervisors) {
        throw consts.supervisors.supervisorListDoesNotExistError;
    }
    const supervisors = userSupervisors.supervisorsList;
    for (let i = 0; i < supervisors.length; i++) {
        if (supervisors[i].supervisorEmail === supervisorEmail) {
            supervisors.splice(i, 1);
            await userSupervisors.save();
            isDeleted=true;
            break;
        }
    }
    return isDeleted;
}

async function updateThreshold(userId, threshHold) {
    let userSupervisors = await Supervisors.findOne({userId: userId});
    if (!userSupervisors) {
        throw consts.supervisors.supervisorListDoesNotExistError;
    }

    userSupervisors.threshold = threshHold;
    await userSupervisors.save();
}

async function getThreshold(userId) {
    const userSupervisors = await Supervisors.findOne({userId: userId});
    if (!userSupervisors) {
        throw consts.supervisors.supervisorListDoesNotExistError;
    }

    return prepareResult.prepareResult([consts.supervisors.threshold, userSupervisors.threshold]);
}

async function deleteSupervisorList(userId) {
    await Supervisors.deleteOne({userId: userId});
}
