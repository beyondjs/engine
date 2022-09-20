const {ipc} = global.utils;

module.exports = function (actions) {
    this.list = require('./list.js');
    this.data = params => actions.data(params, 'launchers/data', 'main');
    this.stop = params => ipc.exec('main', 'launchers/stop', params.id);
    this.start = params => ipc.exec('main', 'launchers/start', params.id);
    this.restart = params => ipc.exec('main', 'launchers/restart', params.id);
};