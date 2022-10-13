const ipc = require('beyond/utils/ipc');

module.exports = function () {
    this.update = params => ipc.exec('engine', 'modules/declarations/update', {id: params.id});
}