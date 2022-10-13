const ipc = require('beyond/utils/ipc');

module.exports = function () {
    this.update = async params => ipc.exec('engine', 'applications/declarations/update', params);
    this.updateAll = async params => ipc.exec('engine', 'applications/declarations/updateAll', params);
}