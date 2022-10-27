const DynamicProcessor = require('beyond/utils/dynamic-processor');

module.exports = class extends DynamicProcessor() {
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

    process() {
        throw new Error('This method must be overridden');
    }

    _process() {
        const {code, map} = this.process();
        this.#code = code;
        this.#map = map;
    }

    constructor(conditional) {
        super();
        this.#conditional = conditional;
    }
}
