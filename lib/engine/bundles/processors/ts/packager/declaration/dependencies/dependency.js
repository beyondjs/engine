const NS = require('./ns');
const Default = require('./default');

module.exports = class {
    #ns;
    get ns() {
        return this.#ns;
    }

    #def;
    get def() {
        return this.#def;
    }

    constructor(id) {
        this.#ns = new NS(id);
        this.#def = new Default(id);
    }
}
