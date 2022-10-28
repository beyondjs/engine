const DynamicProcessor = require('beyond/utils/dynamic-processor');

module.exports = class extends DynamicProcessor() {
    get dp() {
        return 'code';
    }

    #conditional;
    get conditional() {
        return this.#conditional;
    }

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

    get valid() {
        return !this.#errors.length;
    }

    process() {
        throw new Error('This method must be overridden');
    }

    _process() {
        const {code, map, errors} = this.process();
        this.#code = code;
        this.#map = map;
        this.#errors = errors ? errors : [];
    }

    constructor(conditional) {
        super();
        this.#conditional = conditional;
    }
}
