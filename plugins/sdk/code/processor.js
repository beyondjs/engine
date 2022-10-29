const Reprocessor = require('beyond/utils/reprocessor');

module.exports = class extends Reprocessor {
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

    processed(response) {
        const {errors, warnings, code, map} = response;

        this.#errors = errors ? errors : [];
        this.#warnings = warnings ? warnings : [];
        this.#code = code;
        this.#map = map;
    }
}
