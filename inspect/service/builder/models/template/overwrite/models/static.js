module.exports = class extends require('../../validator') {
    #entries = new Map();

    skeleton = [];

    constructor(config) {
        super();
        const key = Object.keys(config)[0];
        this.#entries.set(key, config);
    }

    getContent() {
        let output = {};
        this.#entries.forEach(entry => output = {...output, ...entry});
        return output;
    }

    setValues(specs) {
        const key = Object.keys(specs)[0];
        this.#entries.set(key, specs);
    }
}