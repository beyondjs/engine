const {utils: {ipc}} = global;

module.exports = function (helpers) {
    this.list = require('./list.js');
    this.data = params => helpers.data(params, 'launchers/data');
    this.stop = params => ipc.exec('engine', 'launchers/stop', params.id);
    this.start = params => ipc.exec('engine', 'launchers/start', params.id);
    this.restart = params => ipc.exec('engine', 'launchers/restart', params.id);
}