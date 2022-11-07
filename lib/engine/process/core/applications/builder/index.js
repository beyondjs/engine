const {EventEmitter} = require('events');

module.exports = class extends EventEmitter {
    #application;

    async build(distribution, specs) {
        const builder = new (require('./builder'))(this.#application);
        return await builder.build(distribution, specs);
    }

    constructor(application) {
        super();
        this.#application = application;
    }
}