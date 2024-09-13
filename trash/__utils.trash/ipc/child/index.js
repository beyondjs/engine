const IPCServer = require('./server');

module.exports = class extends IPCServer {
    #dispatcher = new (require('../dispatcher'));

    #events = new (require('./events'));
    get events() {
        return this.#events;
    }

    notify(...params) {
        this.#events.emit(...params);
    }

    /**
     * Execute an IPC action
     *
     * @param target {string | undefined} The name of the target process
     * @param action {string} The name of the action being requested
     * @param params {*} The parameters of the action
     * @returns {*}
     */
    async exec(target, action, ...params) {
        return await this.#dispatcher.exec(target, action, ...params);
    }

    destroy() {
        this.#dispatcher.destroy();
        this.#events.destroy();
        super.destroy();
    }
}
