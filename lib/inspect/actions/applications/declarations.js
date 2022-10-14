module.exports = function () {
    const {ipc} = global.utils;
    this.update = params => ipc.exec('engine', 'applications/declarations/update', params);
    this.updateAll = params => ipc.exec('engine', 'applications/declarations/updateAll', params);
}