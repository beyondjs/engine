/**
 * Validates Finder constructor parameters
 *
 * @param path {string} The path where to find the files
 * @param specs {object} The finder specification
 */
module.exports = function (path, specs) {
    'use strict';

    if (!path && !specs) return {};

    specs = specs ? Object.assign({}, specs) : {};
    specs.extname = typeof specs.extname === 'string' ? [specs.extname] : specs.extname;

    if (typeof path !== 'string') {
        throw new Error(`Type of parameter "path" should be a string, but "${typeof path}" was passed`);
    }
    else if (specs.filename && typeof specs.filename !== 'string') {
        throw new Error('Filename specification is invalid');
    }
    else if (specs.extname && !(specs.extname instanceof Array) && typeof specs.extname !== 'string') {
        throw new Error('Extname specification is invalid');
    }
    else if (specs.includes && !(specs.includes instanceof Array)) {
        throw new Error('Includes specification must be an array');
    }
    else if (specs.excludes && !(specs.excludes instanceof Array)) {
        throw new Error('Excludes specification must be an array');
    }

    specs.includes = specs.includes ? specs.includes : ['*'];
    specs.excludes = specs.excludes ? specs.excludes : [];

    return specs;
}
