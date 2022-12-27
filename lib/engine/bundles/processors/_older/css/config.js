module.exports = function (config) {
    const code = {};
    const sources = config;

    code.dom = !!config.dom;
    delete sources.dom;

    return {code, sources}
}
