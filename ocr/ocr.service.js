const db = require('_helpers/db');
const requestPromise = require('request-promise');

module.exports = {
    findDrugByBoxImage
};

async function findDrugByBoxImage(file) {
    const options = {
        method: 'POST',
        uri: 'http://127.0.0.1:5000/drugByBox',
        body: {
            file: file
        },
        json: true
    };

    const result = await requestPromise(options);
}
