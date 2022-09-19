module.exports = class {

    // The process on which the actions will be executed
    #process;

    constructor(fork) {
        // If it is the main process, then it is required the fork parameter
        // with which to establish the communication
        if (!process.send && !fork) throw new Error('Invalid parameters');

        this.#process = fork ? fork : process;
        this.#process.on('message', this.#onmessage);
    }

    #IPCError = require('../error');

    #id = 0;
    #pendings = new Map;

    /**
     * Execute an IPC action
     *
     * @param target {string | undefined} The target process where to execute the action
     * @param action {string} The name of the action being requested
     * @param params {*} The parameters of the action
     * @returns {*}
     */
    exec(target, action, ...params) {
        if (!process.send && target) {
            // Trying to execute from the main process to the main process
            return Promise.reject(new this.#IPCError('Parameter target cannot be "main" in this context'));
        }

        const id = ++this.#id;
        const promise = Promise.pending();
        promise.value.id = id;

        const rq = {
            type: 'ipc.request',
            target: target,
            id: id,
            action: action,
            params: params
        };

        this.#pendings.set(id, promise);
        this.#process.send(rq);

        return promise.value;
    }

    /**
     * Response reception handler
     */
    #onmessage = message => {
        if (typeof message !== 'object' || message.type !== 'ipc.response') return;
        if (!this.#pendings.has(message.id)) {
            console.error('Response message id is invalid', message);
            return;
        }

        const pending = this.#pendings.get(message.id);
        const {response, error} = message;
        error && console.error((error instanceof Error || error.stack) ? error.stack : error);
        error ? pending.reject(new this.#IPCError(error)) : pending.resolve(response);

        this.#pendings.delete(message.id);
    }

    destroy() {
        this.#process.removeListener('message', this.#onmessage);
    }
}
