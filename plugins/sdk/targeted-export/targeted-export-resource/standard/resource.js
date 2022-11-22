module.exports = class {
    #diagnostics;
    get diagnostics() {
        return this.#diagnostics;
    }

    #code;
    get code() {
        return this.#code;
    }

    #map;
    get map() {
        return this.#map;
    }

    constructor(values) {
        values && this.#set(values);
    }

    #set({diagnostics, code, map}) {
        this.#diagnostics = diagnostics;
        this.#code = code;
        this.#map = map;
    }

    toJSON() {
        const {diagnostics, code, map} = this;
        return {diagnostics, code, map};
    }

    hydrate(cached) {
        this.#set(cached);
    }
}
