const {ipc} = require('beyond/utils/ipc');

module.exports = function () {
    this.config = async function () {
        const config = {};
        config.client = await ipc.exec('engine', 'server/config');
        config.server = await ipc.exec('engine', 'server/config');

        return config;
    }
}
