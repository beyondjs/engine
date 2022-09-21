module.exports = function () {
    this.config = async function () {
        const {utils: {ipc}} = global;

        const config = {};
        config.client = await ipc.exec('engine', 'server/config');
        config.server = await ipc.exec('engine', 'server/config');

        return config;
    };
};