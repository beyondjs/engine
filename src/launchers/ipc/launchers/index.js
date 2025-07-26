module.exports = function (launchers) {
    'use strict';

    this.data = require('./data.js')(launchers);
    this.list = require('./list.js')(launchers);
    this.stop = require('./stop.js')(launchers);
    this.start = require('./start.js')(launchers);
    this.ready = require('./ready.js')(launchers);
    this.restart = require('./restart.js')(launchers);
};
