module.exports = function (instances) {
    'use strict';

    this.data = require('./data.js')(instances);
    this.list = require('./list.js')(instances);
    this.stop = require('./stop.js')(instances);
    this.start = require('./start.js')(instances);
    this.ready = require('./ready.js')(instances);
    this.restart = require('./restart.js')(instances);
};
