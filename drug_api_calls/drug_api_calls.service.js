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
        const options = {
            uri: 'https://rximage.nlm.nih.gov/api/rximage/1/rxnav?rxcui=' + rxcui,
            json: true
        };
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

async function findInteractions(email, profileName, newRxcui) {
    const drugList = (await calendarService.getByEmailAndName(email, profileName)).drug_info_list;
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
            const options = {
                uri: 'https://rxnav.nlm.nih.gov/REST/interaction/list.json?rxcuis=' + rxcuisJoined.join('+'),
                json: true
            };
            const result = await requestPromise(options);
            parsedInter = parseInteraction(result, newRxcui);
        }
    }
    return parsedInter;
}

async function findDrugByImage(file) {
    if (file !== undefined && file.buffer !== undefined) {
        const options = {
            method: 'POST',
            uri: 'http://127.0.0.1:5000/drugByImage',
            body: {
                file: file.buffer
            },
            json: true
        };

        const result = await requestPromise(options);
        //  todo send request to api with the properties
    }
    return {};
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
    const options = {
        uri: 'https://rxnav.nlm.nih.gov/REST/drugs',
        qs: {
            name: drugName
        },
        json: false
    };

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
        var interactionsType = interactionResult.fullInteractionTypeGroup[0].fullInteractionType; // in [0] is from drugBank, in [1] frm ONCHigh
        for (var i = 0; i < interactionsType.length; i++) {
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
