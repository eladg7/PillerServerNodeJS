const fs = require('fs');

const xml2js = require('xml2js');
const parser = new xml2js.Parser();
const requestPromise = require('request-promise');
const calendarService = require('../calendar/calendar.service');
const consts = require('../_helpers/consts');

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

function drugHasRxcui(rxcui) {
    return rxcui !== "0";
}

async function getDrugImage(rxcui) {
    let imageSrc = "";
    if (drugHasRxcui(rxcui)) {
        const options = buildRequestOptions(true, consts.drugApiCalls.drugImageRXUrl + rxcui);
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
    if (drugHasRxcui(newRxcui)) {
        const rxcuisJoined = [];
        //  push new rxcui
        rxcuisJoined.push(newRxcui);
        //  push all current drug rxcui that aren't 0
        for (let i = 0; i < drugList.length; i++) {
            if (drugHasRxcui(drugList[i].rxcui)) {
                rxcuisJoined.push(drugList[i].rxcui);
            }
        }
        if (rxcuisJoined.length > 1) {
            const options = buildRequestOptions(true, consts.drugApiCalls.drugInteractionsUrl + rxcuisJoined.join('+'));
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
    let baseUrl = consts.drugApiCalls.drugByImageParametersUrl;
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
        const options = buildRequestOptions(true, consts.drugApiCalls.pythonMLServerUrl, {
            method: consts.RESTRequests.post,
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
}

async function findDrugByName(drugName) {
    //const parsedDrugName=drugName.replace(/ /g,"+");
    const options = buildRequestOptions(false, consts.drugApiCalls.drugByNameUrl, {
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

function responseHasDrugs(drugXML) {
    return typeof drugXML.rxnormdata.drugGroup[0].conceptGroup !== 'undefined';
}

function isItemTTYValid(itemTTY) {
    // there are multiple array because each array is difference TTY, as described ib here:
    // https://mor.nlm.nih.gov/download/rxnav/RxNormAPIs.html#uLink=RxNorm_REST_getDrugs
    //  we'll take only: branded drug (SBD) or branded pack (BPCK)
    return itemTTY === consts.drugApiCalls.SBD || itemTTY === consts.drugApiCalls.SCD || itemTTY === consts.drugApiCalls.SBDC;
}

function parseDrugsXML(drugXML) {
    const drugOptions = [];
    //  make sure that the result contains any drugs, if it doesn't contain any - the conceptGroup will be 'undefined'
    if (responseHasDrugs(drugXML)) {
        //  all the data about the drug (name, rxcui, etc.) is in drugXML.rxnormdata.drugGroup[0].conceptGroup. It is
        //  an array that contains all the possibilities
        for (const item of drugXML.rxnormdata.drugGroup[0].conceptGroup) {
            const itemTTY = item[consts.drugApiCalls.itemTTY].toString()
            if (consts.drugApiCalls.conceptProperties in item && isItemTTYValid(itemTTY)) { // itemTTY === "BPCK"
                drugOptions.push(getDrugsFromConceptProperties(item.conceptProperties));
            }
        }
    }

    return drugOptions;
}

function getDrugsFromConceptProperties(conceptProperties) {
    const drugOptions = [];
    for (const item of conceptProperties) {
        drugOptions.push({rxcui: item[consts.drug.rxcui], name: item[consts.drug.name]});
    }
    return drugOptions;
}
