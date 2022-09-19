const {ipc} = global.utils;

module.exports = function (actions) {
    this.list = require('./list.js');
    this.data = params => actions.data(params, 'bees/data', 'main');
    this.stop = params => ipc.exec('main', 'bees/stop', params.id);
    this.start = params => ipc.exec('main', 'bees/start', params.id);
    this.restart = params => ipc.exec('main', 'bees/restart', params.id);
};