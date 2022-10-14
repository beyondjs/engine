const {utils: {ipc}} = global;

module.exports = function (plm) {
    this.list = require('./list.js');
    this.data = params => {
        console.log('launcher distributions data')
        return plm.data(params, 'launchers/data', 'main');
    }
    this.stop = params => {
        console.log('launcher distributions stop')
        return ipc.exec('main', 'launchers/stop', params.id);
    }
    this.start = params => {
        console.log('launcher distributions start')
        return ipc.exec('main', 'launchers/start', params.id);
    }
    this.restart = params => {
        console.log('launcher distributions restart')
        return ipc.exec('main', 'launchers/restart', params.id);
    }
}