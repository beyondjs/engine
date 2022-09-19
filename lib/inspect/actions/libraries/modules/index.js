const {ipc} = global.utils;

module.exports = function () {
    this.list = require('./list.js');

    this.count = async (params, session) => {
        const monitor = `${session.monitor}-client`;
        return await ipc.exec(monitor, 'libraries/modules/count', params);
    };

    this.data = async (params, session) => {
        const monitor = `${session.monitor}-client`;
        return await ipc.exec(monitor, 'libraries/modules/data', params);
    };

};