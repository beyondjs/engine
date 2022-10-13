module.exports = class {
    #ws;
    #service;

    async #start(port) {
        console.log('Workspace inspection port is:', port);
        console.log(`http://workspace.beyondjs.com?local=${port}`);
        console.log('--');

        this.#service = new (require('./service'))();
        const actions = new (require('./actions'))(this.#service);

        this.#ws = new (require('./ws'))(port, actions);
        this.#service.setup(this.#ws.server);
    }

    constructor(port) {
        this.#start(port).catch(exc => console.log(exc.stack));
    }
}
