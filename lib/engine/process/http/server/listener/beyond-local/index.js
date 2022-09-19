const {ipc} = global.utils;
const {dashboard} = global;

module.exports = new class {
    #running;

    async check() {
        if (this.#running) return;
        await ipc.exec('main', 'beyond-local/start', dashboard ? 'dashboard' : 'main');
        this.#running = true;
    }
}
