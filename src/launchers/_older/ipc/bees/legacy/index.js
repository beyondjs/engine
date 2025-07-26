module.exports = function (instances) {
    'use strict';

    this.build = require('./build.js')(instances);
};
