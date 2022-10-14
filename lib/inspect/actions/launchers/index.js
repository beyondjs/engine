const {ipc} = global.utils;

module.exports = function (plm) {
    const id = params => {
        if (!params.id) throw new global.StandardError('Parameter "id" not specified');
        return params.id;
    }

    this.status = async params => {
        const data = await ipc.exec('main', 'launchers/data', id(params));
        return data?.status;
    }

    this.start = params => ipc.exec('main', 'launchers/start', id(params));

    this.stop = params => ipc.exec('main', 'launchers/stop', id(params));

    this.restart = params => ipc.exec('main', 'launchers/restart', id(params));

    this.data = params => plm.data(params, 'launchers/data', 'main');

    this.list = params => plm.list(params, 'launchers/list', 'application', 'main');
}
