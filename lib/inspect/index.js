module.exports = class {
    #ws;
    #service;

    constructor(port) {
        this.#service = new (require('./service'))();
        const actions = new (require('./actions'))(this.#service);

        this.#ws = new (require('./ws'))(port, actions);
        this.#service.setup(this.#ws);
    }
}
