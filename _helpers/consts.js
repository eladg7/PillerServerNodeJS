routes = {
    user: '/user',
    calendar: '/calendar',
    profile: '/profile',
    supervisors: '/supervisors',
    drugApiCalls: '/drugApiCalls',
    drugIntakes: '/drugIntakes',
    drugByBoxImage: '/drugByBoxImage'
};

server = {
    uploadLimit: '25mb',
    serverListening: 'Server listening on port ',
    cronEmailTime: '00 00 19 * * *',
};

supervisors = {
    getSupervisorsRoute: '/:userId',
    updateConfirmationRoute: '/confirmation/:userId/:supervisorName/:supervisorEmail',
    addSupervisorRoute: '/:userId/:supervisorName/:supervisorEmail',
    deleteSupervisorRoute: '/:userId/:supervisorEmail',
    unsubscribeSupervisorRoute: '/unsubscribe/:userId/:supervisorEmail',
    updateThresholdRoute: '/threshold/:userId/:threshold',
    getThresholdRoute: '/threshold/:userId',
    deleteSupervisorListRoute: '/:userId',

    confirmationSuccessMessage: 'Confirmation succeeded!',

    unsubscribeLink: '/supervisors/unsubscribe/',
    subscribeLink: '/supervisors/confirmation/',
    supervisorMailTitle: 'Piller - Supervisor Alert',
    userMailTitle: 'Piller - Missed Medicine',
    supervisorsModelName: 'Supervisors',

    supervisorName: 'supervisorName',
    supervisorEmail: 'supervisorEmail',
    isConfirmed: 'isConfirmed',

    defaultThreshold: 3,
    supervisorsList: 'supervisorsList',
    threshold: 'threshold',

    supervisorEmailTitle: 'Piller - Supervisor confirmation',

    supervisorListDoesNotExistError: 'Supervisor list does not exist.',
    supervisorAlreadyExistsError: 'Supervisor already exists.',
    supervisorAlreadyConfirmedError: 'Supervisor has already been confirmed.',
    supervisorNotInUserListError: 'Supervisor in not in user\'s list.',
};

mail = {
    service: 'gmail',
    user: 'piller.inc1@gmail.com',
    password: 'PillerPill',
    emailSent: 'Email sent: '
};

drugApiCalls = {
    findDrugByNameRoute: '/drugByName/:drugName',
    findInteractionsRoute: '/findInteractions/:userId/:profileId/:newRxcui',
    getDrugImageRoute: '/getDrugImage',
    findDrugByImageRoute: '/findDrugByImage',
    findDrugByBoxImageRoute: '/findDrugByBoxImage',

    drugImageRXUrl: 'https://rximage.nlm.nih.gov/api/rximage/1/rxnav?rxcui=',
    drugInteractionsUrl: 'https://rxnav.nlm.nih.gov/REST/interaction/list.json?rxcuis=',
    drugByImageParametersUrl: 'https://rximage.nlm.nih.gov/api/rximage/1/rxnav',
    drugByNameUrl: 'https://rxnav.nlm.nih.gov/REST/drugs',
    pythonMLServerUrl: 'http://127.0.0.1:5000/drugByImage',

    itemTTY: 'tty',
    conceptProperties: 'conceptProperties',
    SBD: 'SBD',
    SCD: 'SCD',
    SBDC: 'SBDC',
};

RESTRequests = {
    post: 'POST',
};

drug = {
    drugModelName: 'Drug',
    drugId: 'drug_id',
    repeatEnd: 'repeat_end',
    drugInfoList: 'drug_info_list',
    drugInfo: 'drug_info',
    name: 'name',
    rxcui: 'rxcui',

    cantGetDrugInfoError: 'Drug id was not found in data base. Could not get drug Info.',
    cantDeleteDrugError: 'Could not delete drug, drug does not exist.',
};

calendar = {
    getSpecificCalendarRoute: '/:userId/:profileId',
    updateDrugRoute: '/updateDrug/:userId/:profileId/:drug_id',
    deleteDrugRoute: '/deleteDrug/:userId/:profileId',
    deleteCalendarRoute: '/:userId/:profileId',
    addDrugRoute: '/addDrug/:userId/:profileId',
    deleteFutureDrugRoute: '/deleteFutureOccurrencesOfDrugByUser/:userId/:profileId',

    calendarNotFound: 'User\'s calendar not found',

    calendarModelName: 'Calendar',
    calendarId: 'calendar_id',
};

dose = {
    doseModelName: 'Dose',
    dose: 'dose',
    doseId: 'dose_id',
    doseInfo: 'dose_info',
    totalDose: 'total_dose',
    measurementType: 'measurement_type',
    defaultMeasurementType: 'mg',
    allMeasurementTypes: ['mg', 'g', 'mcg', 'meq', 'iu', 'Pill'],
    defaultTotalDose: 0.0,
};

refill = {
    refill: 'refill',
    refillModelName: 'Refill',
    refillId: 'refill_id',
    refillInfo: 'refill_info',
    isToNotify: 'is_to_notify',
    pillsLeft: 'pills_left',
    pillsBeforeReminder: 'pills_before_reminder',
    reminderTime: 'reminder_time',

    refillDoesntExistError: 'Refill id does not exists',

    defaultIsToNotify: false,
    defaultPillsLeft: 0,
    defaultPillsBeforeReminder: 0,
    defaultReminderTime: "00:00"
};

intake = {
    setIntakeTakenRoute: '/setIntakeTaken/:taken_id/:refill_id/:date',
    setIntakeNotTakenRoute: '/setIntakeNotTaken/:taken_id/:refill_id/:date',
    getAllIntakesRoute: '/getAllIntakes/:taken_id',

    intakeNotFoundError: 'Intake dates not found',

    intakeDates: 'intake_dates',
    takenId: 'taken_id',
    intakes: 'intakes',
    modelName: 'IntakeDates',
};

ocr = {
    findDrugByBoxImageRoute: '/findDrugByBoxImage',
    findDrugByBoxImagePythonURL: 'http://127.0.0.1:5000/drugByBox',
    parserError: 'Parser error',
};

occurrence = {
    occurrence: 'occurrence',
    eventId: 'event_id',
    defaultRepeatStart: Date.now,
    defaultRepeatYear: 0,
    defaultRepeatMonth: 0,
    defaultRepeatDay: 0,
    defaultRepeatWeek: 0,
    defaultRepeatWeekday: 0,
    defaultRepeatEnd: "0"
};

profile = {
    profileModelName: 'Profile',
    getAllProfilesRoute: '/:userId',
    initProfileListRoute: '/:userId',
    addProfileRoute: '/:userId',
    deleteProfileRoute: '/:userId/:profileId',
    deleteAllProfilesRoute: '/:userId',

    profileListModelName: 'ProfileList',
    profileList: 'profile_list',


    profileDoesNotExistError: 'Profiles does not exist.',
    profileAlreadyExistsError: 'Profile already exists.',

    profileId: 'id',
    profileRelation: 'relation',
    profileName: 'name',
};

user = {
    emailResetPasswordRoute: '/resetPassword/:email',
    authenticateRoute: '/authenticate',
    registerRoute: '/register',
    updateEmailUsernamePasswordRoute: '/:userId',
    deleteUserRoute: '/:userId',

    userEmailPasswordError: 'Username or password is incorrect',
    profileForUserDoesntExistError: 'Profile for user does no exist.',
    wrongPasswordError: 'Wrong password',

    defaultCreateDate: Date.now,

    userModelName: 'User',
    tokenExpire: '7d',

    passwordResetEmailTitle: 'Password Reset For Piller',

    passwordSalt: 10,
    mainUserRelation: 'main-user',

    email: 'email',
    createDate: 'createDate',
    profileId: 'profileId',
    id: 'id',
    token: 'token',
    profileName: 'profileName',
};

serverConfig = {'IP': 'localhost', 'port': 3000};

module.exports = {
    routes,
    server,
    mail,
    calendar,
    serverConfig,
    drug,
    occurrence,
    intake,
    dose,
    refill,
    RESTRequests,
    drugApiCalls,
    ocr,
    profile,
    user,
    supervisors,
};
