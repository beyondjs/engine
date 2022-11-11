const Server = require('./server');
const ports = require('beyond/utils/ports');

module.exports = class {
    #specs;
    #inspect;

    #server;

    #errors = [];
    get errors() {
        return this.#errors;
    }

    #status = 'stopped';
    get status() {
        return this.#status;
    }

    constructor(specs, inspect) {
        this.#specs = specs;
        this.#inspect = inspect;

        console.log('Application server auto-initialisation should be removed');
        this.start().catch(exc => console.log(exc.stack));
    }

    async start() {
        const {port} = this.#specs;
        const available = await ports.check(port);
        if (!available) {
            this.#errors = [`Port "${port}" is unavailable`];
            return;
        }

        this.#server = new Server(this.#specs, {inspect: this.#inspect});
    }

    stop() {
        this.#server?.destroy();
        this.#server = void 0;
    }

    destroy() {
        this.stop();
    }
}
