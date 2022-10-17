const {createServer} = require('http');
const {ports} = global.utils;

module.exports = class {
    #ws;
    #service;
    #server;
    #listener;

    async #start(port) {
        const available = await ports.check(port);
        if (!available) {
            console.log(`Workspace port ${port} is already in use`.red);
            return;
        }

        this.#server = createServer(this.#listener);
        this.#server.listen(port);
        console.log(`Workspace inspection port is`, port);

        this.#service = new (require('./service'))();
        const actions = new (require('./actions'))(this.#service);

        this.#ws = new (require('./ws'))(this.#server, actions);
        this.#service.setup(this.#ws.server);
    }

    constructor(port) {
        this.#listener = require('./server')();
        this.#start(port).catch(exc => console.error(exc.stack));
    }
}
