module.exports = new class extends Map {
    #ready = Promise.pending();
    get ready() {
        return this.#ready.value;
    }

    #process = async () => {
        const path = require('path').join(global.lib, '../packages/local');
        const config = new global.utils.Config(path, {'/start': 'object', '/static': 'object'});

        config.data = 'library.json';
        await config.ready;
        this.set(path, config);

        this.#ready.resolve();
    }

    constructor() {
        super();
        this.#process().catch(exc => console.error(exc.stack));
    }
}
