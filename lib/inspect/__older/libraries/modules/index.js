const {ipc} = global.utils;

module.exports = function () {
    this.list = require('./list.js');

    this.count = async params => ipc.exec('engine', 'libraries/modules/count', params);
    this.data = async params => ipc.exec('engine', 'libraries/modules/data', params);
}