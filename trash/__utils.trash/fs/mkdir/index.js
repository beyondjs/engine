const fs = require('fs');
const {promisify} = require('util');
const mkdir = promisify(fs.mkdir);

module.exports = async function (target, options) {
    'use strict';

    options = options ? options : {};
    return options.recursive ? await require('./recursive.js')(target, mkdir) : await mkdir(target);

};
