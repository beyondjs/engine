/**
 * Process the configuration of the sources
 *
 * @param config
 * @return {{errors: [string]}|{path: (*|string), warnings: [], value: {excludes: Array, includes: Array, extname: *}}}
 */
module.exports = function (config) {
    const warnings = [];

    let path, files, excludes;
    if (typeof config === 'string') {
        files = [config];
    }
    else if (config instanceof Array) {
        files = config;
    }
    else if (typeof config === 'object') {
        path = config.path;
        files = config.files;
        files = typeof files === 'string' ? [files] : files;
        excludes = config.excludes;
    }
    else if (config === undefined) {
        files = ['*'];
    }
    else {
        return {errors: ['Invalid configuration']};
    }

    if (!(files instanceof Array)) {
        return {errors: ['Files configuration not set']};
    }

    excludes = excludes ? excludes : [];
    if (!(excludes instanceof Array)) {
        warnings.push(`Excludes configuration is invalid`);
        excludes = [];
    }

    !excludes.includes('module.json') && excludes.push('module.json');
    const value = {includes: files, excludes: excludes};
    path = path ? path : '';

    return {path: path, warnings: warnings, value: value};
}
