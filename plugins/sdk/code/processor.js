module.exports = class {
    #working = false;
    get working() {
        return this.#working;
    }

    #done = false;
    get done() {
        return this.#done;
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

    #time;
    /**
     * Timestamp when the last process was made
     * @return {number}
     */
    get time() {
        return this.#time;
    }

    #request;

    cancel() {
        this.#request = void 0;
    }

    async process() {

    }

    _process() {

    }
}
