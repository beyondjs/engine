module.exports = class {
    #code;
    get code() {
        return this.#code;
    }

    #map;
    get map() {
        return this.#map;
    }

    constructor({code, map}) {
        this.#code = code;
        this.#map = map;
    }

    toJSON() {
        const {code, map} = this;
        return {code, map};
    }
}
