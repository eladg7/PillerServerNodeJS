const fs = require('fs');

const xml2js = require('xml2js');
const parser = new xml2js.Parser();
const requestPromise = require('request-promise');
const calendarService = require('../calendar/calendar.service');

parser.on('error', function (err) {
    console.log('Parser error', err);
    throw err;
});

module.exports = {
    findDrugByName,
    findInteractions,
    getDrugImage,
    findDrugByImage
};

async function getDrugImage(rxcui) {
    let imageSrc = "";
    if (rxcui !== "0") {
        const options = buildRequestOptions(true, 'https://rximage.nlm.nih.gov/api/rximage/1/rxnav?rxcui=' + rxcui);
        const result = await requestPromise(options);
        imageSrc = getImageFromResult(result);
    }

    return {imageSrc: imageSrc};
}

function getImageFromResult(result) {
    let imageSrc = "";
    if (result != null && result.replyStatus.success && result.nlmRxImages.length > 0) {
        imageSrc = result.nlmRxImages[0].imageUrl;
    }
    return imageSrc;
}

async function findInteractions(userId, profileId, newRxcui) {
    const drugList = (await calendarService.getSpecificCalendar(userId, profileId)).drug_info_list;
    let parsedInter = [];
    if (newRxcui !== "0") {
        const rxcuisJoined = [];
        //  push new rxcui
        rxcuisJoined.push(newRxcui);
        //  push all current drug rxcui that aren't 0
        for (let i = 0; i < drugList.length; i++) {
            if (drugList[i].rxcui !== "0") {
                rxcuisJoined.push(drugList[i].rxcui);
            }
        }
        if (rxcuisJoined.length > 1) {
            const options = buildRequestOptions(true, 'https://rxnav.nlm.nih.gov/REST/interaction/list.json?rxcuis=' + rxcuisJoined.join('+'));
            const result = await requestPromise(options);
            parsedInter = parseInteraction(result, newRxcui);
        }
    }
    return parsedInter;
}

function buildRequestOptions(isJson, uri, properties = {}) {
    //  Object.assign merges two dictionaries
    return Object.assign({}, {
        uri: uri,
        json: isJson
    }, properties);
}

function getDrugSearchByImageURI(properties) {
    let baseUrl = "https://rximage.nlm.nih.gov/api/rximage/1/rxnav";
    let isFirst = true;
    for (const [key, value] of Object.entries(properties)) {
        if (isFirst) {
            isFirst = false;
            baseUrl += "?" + key + "=" + value;
        } else {
            baseUrl += "&" + key + "=" + value;
        }
    }
    return baseUrl;
}

async function getDrugsByProperties(properties) {
    let options = buildRequestOptions(true, getDrugSearchByImageURI(properties));
    const drugsProperties = await requestPromise(options);
    return getDrugsFromConceptProperties(drugsProperties.nlmRxImages);
}

async function findDrugByImage(file) {
    let drugs = [];
    if (file !== undefined && file.buffer !== undefined) {
        const options = buildRequestOptions(true, 'http://127.0.0.1:5000/drugByImage', {
            method: 'POST',
            body: {
                file: file.buffer
            }
        });

        const result = await requestPromise(options);
        //  send request only if the ML detected properties
        if (Object.keys(result).length > 0) {
            drugs = getDrugsByProperties(result);
        }
    }
    return drugs;

    //  todo delete next line (and the function) i left it here only so you will be able to see the image that
    //  the user sent
    // saveImage('iamge.jpg', file.buffer);
}

function saveImage(filename, data) {
    const myBuffer = new Buffer(data.length);
    for (let i = 0; i < data.length; i++) {
        myBuffer[i] = data[i];
    }
    fs.writeFile(filename, myBuffer, function (err) {
        if (err) {
            console.log(err);
        } else {
            console.log("The file was saved!");
        }
    });
}

async function findDrugByName(drugName) {
    //const parsedDrugName=drugName.replace(/ /g,"+");
    const options = buildRequestOptions(false, 'https://rxnav.nlm.nih.gov/REST/drugs', {
        qs: {
            name: drugName
        }
    });

    const result = await requestPromise(options);
    let parsedResult = null;
    await parser.parseString(result, function (err, result) {
        if (err) {
            throw err;
        }
        parsedResult = result;
    });
    return parseDrugsXML(parsedResult);
}


function parseInteraction(interactionResult, newRxcui) {
    const result = [];
    if (interactionResult.fullInteractionTypeGroup !== undefined) {
        //there are interactions
        let interactionsType = interactionResult.fullInteractionTypeGroup[0].fullInteractionType; // in [0] is from drugBank, in [1] frm ONCHigh
        for (let i = 0; i < interactionsType.length; i++) {
            //notify interaction with the new drug only
            if (interactionsType[i].minConcept[0].rxcui == newRxcui) {
                // push the first interaction drug
                result.push({
                    interaction: {
                        rxcui: interactionsType[i].minConcept[1].rxcui, name: interactionsType[i].minConcept[1].name
                    },
                    description: interactionsType[i].interactionPair[0].description
                })
            } else if (interactionsType[i].minConcept[1].rxcui == newRxcui) {
                //push the second interaction drug
                result.push({
                    interaction: {
                        rxcui: interactionsType[i].minConcept[0].rxcui, name: interactionsType[i].minConcept[0].name
                    },
                    description: interactionsType[i].interactionPair[0].description
                })
            }

        }
    }

    return result;

}

function parseDrugsXML(drugXML) {
    const drugOptions = [];
    //  make sure that the result contains any drugs, if it doesn't contain any - the conceptGroup will be 'undefined'
    if (typeof drugXML.rxnormdata.drugGroup[0].conceptGroup !== 'undefined') {
        //  all the data about the drug (name, rxcui, etc.) is in drugXML.rxnormdata.drugGroup[0].conceptGroup. It is
        //  an array that contains all the possibilities
        for (const item of drugXML.rxnormdata.drugGroup[0].conceptGroup) {
            // there are multiple array because each array is difference TTY, as described ib here:
            // https://mor.nlm.nih.gov/download/rxnav/RxNormAPIs.html#uLink=RxNorm_REST_getDrugs
            //  we'll take only: branded drug (SBD) or branded pack (BPCK)
            const itemTTY = item["tty"].toString()
            if ("conceptProperties" in item &&
                (itemTTY === "SBD" || itemTTY === "SCD" || itemTTY === "SBDC")) { // itemTTY === "BPCK"
                drugOptions.push(getDrugsFromConceptProperties(item.conceptProperties));
            }
        }
    }

    return drugOptions;
}

function getDrugsFromConceptProperties(conceptProperties) {
    const drugOptions = [];
    for (const item of conceptProperties) {
        drugOptions.push({rxcui: item["rxcui"], name: item["name"]});
    }
    return drugOptions;
}
