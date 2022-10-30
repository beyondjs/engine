module.exports = class {
    #code;
    get code() {
        return this.#code;
    }

    #map;
    get map() {
        return this.#map;
    }

    #errors = [];
    get errors() {
        return this.#errors;
    }

    #warnings = [];
    get warnings() {
        return this.#warnings;
    }

    get valid() {
        return !this.#errors.length;
    }
}
