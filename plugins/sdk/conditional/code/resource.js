module.exports = class {
    #code;
    get code() {
        return this.#code;
    }

    #map;
    get map() {
        return this.#map;
    }

    #errors;
    get errors() {
        return this.#errors;
    }

    #warnings;
    get warnings() {
        return this.#warnings;
    }

    get valid() {
        return !this.#errors.length;
    }

    constructor({code, map, errors, warnings}) {
        this.#code = code;
        this.#map = map;
        this.#errors = errors ? errors : [];
        this.#warnings = warnings ? warnings : [];
    }

    toJSON() {
        const {code, map, errors, warnings} = this;
        return {code, map, errors, warnings};
    }
}
