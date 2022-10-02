module.exports = function (instances) {
    'use strict';

    this.specs = require('./specs.js')(instances);
    this.start = require('./start.js')(instances);
};
