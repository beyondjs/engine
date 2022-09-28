const {ipc} = global.utils;

module.exports = function () {
    const id = params => {
        if (!params.id) throw new global.StandardError('Parameter "id" not specified');
        return params.id;
    }

    this.status = async params => {
        const data = await ipc.exec('main', 'launchers/data', id(params));
        return data?.status;
    }

    this.start = async params => {
        await ipc.exec('main', 'launchers/start', id(params));
    }

    this.stop = async params => {
        await ipc.exec('main', 'launchers/stop', id(params));
    }
}
