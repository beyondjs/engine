module.exports = class {
    #server;
    #dispatchers;

    constructor(server, dispatchers) {
        this.#server = server;
        this.#dispatchers = dispatchers;
    };

    #listeners = new Map;

    register = (name, fork) =>
        this.#listeners.set(name, new (require('./listener'))(this.#server, fork, this.#dispatchers));

    destroy() {
        this.#listeners.forEach(listener => listener.destroy());
    }
}
