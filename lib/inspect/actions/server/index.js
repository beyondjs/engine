const {ipc} = global.utils;

module.exports = function () {
    this.config = async function (params, session) {
        const monitor = `${session.monitor}-client`;

        const config = {};
        config.client = await ipc.exec(monitor, 'server/config');
        config.server = await ipc.exec('main', 'server/config');

        return config;
    };
};