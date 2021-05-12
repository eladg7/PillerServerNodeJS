const db = require('_helpers/db');
const requestPromise = require('request-promise');
const xml2js = require("xml2js");
const parser = new xml2js.Parser();
const drug_apiService = require('../drug_api_calls/drug_api_calls.service');
const consts = require('_helpers/consts');

module.exports = {
    findDrugByBoxImage
};

parser.on('error', function (err) {
    console.log(consts.ocr.parserError, err);
    throw err;
});

async function findDrugByBoxImage(file) {
    //  todo handle file is undefined
    const options = {
        method: consts.RESTRequests.post,
        uri: consts.ocr.findDrugByBoxImagePythonURL,
        body: {
            file: file.buffer
        },
        json: true
    };

    const result = await requestPromise(options);
    return await findDrugNameFromString(result);
}

async function findDrugNameFromString(possibleDrugName) {
    const splittedResult = possibleDrugName.split(/\r\n|\r|\n/).filter(function (entry) {
        return /\S/.test(entry);
    });
    const measurementResult = findMeasurementInfo(possibleDrugName);
    return await findPossibleDrugNames(splittedResult, measurementResult);
}

async function findPossibleDrugNames(splittedResult, measurementResult) {
    let drugOptions = [];
    drugOptions = await findPossibleDrugNamesWithMeasurement(splittedResult, measurementResult);
    if (drugOptions.length === 0) {
        //could not find results when added measurement to string
        drugOptions = await findPossibleDrugNamesWithoutMeasurement(splittedResult);
    }
    return drugOptions;
}

async function findPossibleDrugNamesWithMeasurement(splittedResult, measurementResult) {
    let drugOptions = []
    for (let i = 0; i < splittedResult.length; i++) {
        const possibleName = changeDrugNameToContainMeasuremnt(splittedResult[i], measurementResult);
        let resultOptions = await drug_apiService.findDrugByName(possibleName);
        if (resultOptions.length > 0) {
            //more options
            drugOptions = resultOptions;
            break;
        }
    }
    return drugOptions;
}

async function findPossibleDrugNamesWithoutMeasurement(splittedResult) {
    let drugOptions = []
    for (let i = 0; i < splittedResult.length; i++) {
        const possibleName = splittedResult[i];
        let resultOptions = await drug_apiService.findDrugByName(possibleName);
        if (resultOptions.length > 0) {
            //more options
            drugOptions = resultOptions;
            break;
        }
    }
    return drugOptions;
}


function changeDrugNameToContainMeasuremnt(name, measurementResult) {
    const arrMeasur = measurementResult.toLowerCase().split(" ");
    const arr = name.toLowerCase().split(" ");

    for (let index = arr.length - 1; index >= 0; index--) {
        const temp = arr[index].replace(/\d/g, "");
        if (temp === arrMeasur[1] || temp === "") { //measurment type (mg) or only digits
            //remove from string the measuremnt to not add it twice
            arr.splice(index, 1);
        }
    }
    return arr.join(" ") + " " + measurementResult;
}


function findMeasurementInfo(possibleDrugName) {
    //split by white space
    const splittedResult = possibleDrugName.split(/\s+/).filter(Boolean);
    let measurementResult = "";
    for (let i = 0; i < splittedResult.length; i++) {
        let temp = splittedResult[i];
        temp.toLowerCase();
        if (consts.dose.allMeasurementTypes.includes(temp)) {
            //found measurements without digit, digit is before
            if (i > 0) {
                measurementResult = splittedResult[i - 1] + " " + splittedResult[i]
                break;
            }
        } else {
            temp = temp.replace(/\d/g, ""); // remove digits
            if (consts.dose.allMeasurementTypes.includes(temp)) {
                //add whitespace between
                measurementResult = splittedResult[i].toLowerCase().replace(temp, " " + temp);
                break;
            }
        }
    }
    return measurementResult;
}
