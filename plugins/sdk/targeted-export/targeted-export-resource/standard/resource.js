module.exports = class {
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

    #set({code, map}) {
        this.#code = code;
        this.#map = map;
    }

    toJSON() {
        const {code, map} = this;
        return {code, map};
    }

    hydrate(cached) {
        this.#set(cached);
    }
}
