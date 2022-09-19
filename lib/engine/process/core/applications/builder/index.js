const {EventEmitter} = require('events');

module.exports = class extends EventEmitter {
    #application;

    async build(distribution) {
        const engine = this.#application.engine === 'legacy' ? 'legacy' : 'v1';
        const builder = new (require(`./${engine}`))(this.#application);
        return await builder.build(distribution);
    }

    constructor(application) {
        super();
        this.#application = application;
    }
}