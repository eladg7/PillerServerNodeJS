function prepareResult(...args) {
    let result = {};
    args.forEach(arg => {
            result[arg[0]] = arg[1];
        }
    )
    return result;
}

module.exports = {prepareResult};
