/**
 * Returns the list of backend bridges
 */
module.exports = async function (bundle, distribution, language) {
    // Getting the packager
    const packager = bundle.packagers.get(distribution, language);
    await packager.processors.ready;

    if (!packager.processors.has('ts')) return;

    // It is not required the analyzer to be ready, as the bridges process independently
    const {analyzer} = packager.processors.get('ts');
    await analyzer.ready;

    const {bridges} = analyzer;
    const exports = bridges ? [...bridges] : [];
    return exports && exports.map(([key, methods]) => [key, [...methods]]);
}
