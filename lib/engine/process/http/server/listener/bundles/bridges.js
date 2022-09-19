/**
 * Return the bridges of a bundle in backend platform
 *
 * @param packager {object} The bundle packager or transversal bundle packager
 * @return {Promise<*>}
 */
module.exports = async function (packager) {
    'use strict';

    const done = ({bridges}) => {
        const content = JSON.stringify({bridges});
        return new global.Resource({content, extname: '.json'});
    }

    // Getting the packager
    await packager.processors.ready;
    if (!packager.processors.has('ts')) return done({});

    // It is not required the analyzer to be ready, as the bridges process independently
    const {analyzer} = packager.processors.get('ts');
    await analyzer.ready;

    const exports = analyzer.bridges ? [...analyzer.bridges] : [];
    const bridges = exports && exports.map(([key, methods]) => [key, [...methods]]);
    return done({bridges});
}
