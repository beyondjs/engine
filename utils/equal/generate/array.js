/**
 * Generates a comparable array
 *
 * @param value {generate}
 * @returns {string}
 */
module.exports = function (value) {
    'use strict';

    if (!(value instanceof Array)) throw new Error('Parameter must be an array');

    const generate = (require('.'));
    const output = value.map(item => generate(item));
    return JSON.stringify(output.sort());
}
