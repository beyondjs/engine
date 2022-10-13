const ipc = require('beyond/utils/ipc');

module.exports = class {
    id(params) {
        if (!params.id) throw new global.StandardError('Parameter "id" not specified');

        const instance = global.dashboard ? 'dashboard' : 'main';
        return [params.id, instance];
    }

    async status(params) {
        const data = await ipc.exec('main', 'launchers/data', ...id(params));
        return data?.status;
    }

    async start(params) {
        await ipc.exec('main', 'launchers/start', ...id(params));
    }

    async stop(params) {
        await ipc.exec('main', 'launchers/stop', ...id(params));
    }
}
