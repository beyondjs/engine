const ports = require('beyond/utils/ports');

module.exports = class {
    #ws;
    #service;

    async #start(port) {
        const available = await ports.check(port);
        if (!available) {
            console.log(`Workspace port ${port} is already in use`.red);
            return;
        }

        console.log(`Workspace inspection port is`, port);

        this.#service = new (require('./service'))();
        const actions = new (require('./actions'))(this.#service);

        this.#ws = new (require('./ws'))(port, actions);
        this.#service.setup(this.#ws.server);
    }

    constructor(port) {
        this.#start(port).catch(exc => console.log(exc.stack));
    }
}
