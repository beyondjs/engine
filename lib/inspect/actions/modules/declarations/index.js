const {ipc} = global.utils;

module.exports = function () {
    this.update = (params, session) => {
        const monitor = `${session.monitor}-client`;
        return ipc.exec(monitor, 'modules/declarations/update', {id: params.id});
    };
};