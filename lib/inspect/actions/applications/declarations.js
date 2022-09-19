const {ipc} = global.utils;

module.exports = function () {
    this.update = async (params, session) => {
        const monitor = `${session.monitor}-client`;
        return await ipc.exec(monitor, 'applications/declarations/update', params);
    };

    this.updateAll = async (params, session) => {
        const monitor = `${session.monitor}-client`;
        return await ipc.exec(monitor, 'applications/declarations/updateAll', params);
    };
}