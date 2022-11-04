const {File} = require('beyond/utils/finder');
const {Diagnostic} = require('beyond/plugins/sdk');

module.exports = class extends File {
    #code;
    get code() {
        return this.#code;
    }

    #map;
    get map() {
        return this.#map;
    }

    #diagnostics;
    get diagnostics() {
        return this.#diagnostics;
    }

    constructor(file, code, map, diagnostics) {
        super();
        file && this.hydrate({file, code, map, diagnostics});
    }

    toJSON() {
        const file = super.toJSON();
        const {code, map, diagnostics} = this;
        return Object.assign({file, code, map, diagnostics});
    }

    hydrate(cached) {
        super.hydrate(cached.file);
        this.#code = cached.code;
        this.#map = cached.map;

        this.#diagnostics = cached.diagnostics.map(cached => {
            const diagnostic = new Diagnostic();
            diagnostic.hydrate(cached);
            return diagnostic;
        });
    }
}
