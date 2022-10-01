module.exports = function (value) {
    'use strict';

    if (typeof value !== 'object') return value;

    const type = value instanceof Array ? 'array' : 'object';
    return require(`./${type}.js`)(value);
}
