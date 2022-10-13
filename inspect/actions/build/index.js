const ipc = require('beyond/utils/ipc');

module.exports = async function (params) {
    return await ipc.exec('engine', 'applications/build', params);
}
