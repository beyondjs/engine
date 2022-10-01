/**
 * Parse the bundle filename to extract the bundle name and language on multilanguage bundles.
 *
 * @param application {object} The application object
 * @param filename {string} The filename of the resource. ex: 'txt.es'
 * @param extname {string} The extension of the resource. ex: '.js'
 * @return {{bundle}|{error}|{language: *, bundle: *}}
 */
exports.parse = function (application, filename, extname) {
    'use strict';

    if (extname !== '.js') return {bundle: filename};

    const split = filename.split('.');
    if (split.length > 3) {
        const error = `Bundle "${filename}" is invalid`;
        return {error};
    }

    const bundle = split.shift();
    const language = split.length === 3 ? split.shift() : void 0;

    if (language && language.length !== 2) {
        return {error: `Language "${language}" is invalid`};
    }
    if (language && !application.languages.supported.includes(language)) {
        return {error: `Language "${language}" is not supported by current application`};
    }

    return {bundle, language};
}

exports.check = function (resource, multilanguage, language) {
    if (!multilanguage && language) {
        const error = `Language is specified ("${language}"), but resource "${resource}" is not multilanguage.`;
        return {error};
    }

    if (multilanguage && !language) {
        const error = `Language should be specified as the resource "${resource}" is multilanguage.`;
        return {error};
    }

    return {};
}