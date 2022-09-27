const DynamicProcessor = global.utils.DynamicProcessor();
const ports = (require('./ports'));

module.exports = class extends DynamicProcessor {
    get dp() {
        return 'library.config.ports';
    }

    #library;

    #host;
    get host() {
        return this.#host;
    }

    constructor(library) {
        super();
        this.#library = library;
        super.setup()
    }

    _prepared(require) {
        if (!require(this.#library)) return false;
        this.#library.legacyBackend && require(ports.get(this.#library.package));
    }

    _process() {
        this.#host = void 0;
        if (!this.#library.legacyBackend) return;

        const port = ports.get(this.#library.package);
        this.#host = {host: `http://localhost:${port.value}`, local: 'legacy'};
    }
}
