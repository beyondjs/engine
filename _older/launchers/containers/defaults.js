module.exports = new class extends Map {
    #ready = Promise.pending();
    get ready() {
        return this.#ready.value;
    }

    #append = async (directory) => {
        const path = require('path').join(global.lib, 'client', directory);
        const config = new global.utils.Config(path, {
            '/node': 'object',
            '/ssr': 'object',
            '/backend': 'object',
            '/legacyBackend': 'object'
        });

        config.data = 'library.json';
        await config.ready;
        this.set(path, config);
    };

    #process = async () => {
        await this.#append('browser/local');
        this.#ready.resolve();
    }

    constructor() {
        super();
        this.#process().catch(exc => console.error(exc.stack));
    }
}
