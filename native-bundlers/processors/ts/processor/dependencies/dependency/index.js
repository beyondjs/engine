const {Dependency} = require('beyond/bundler-helpers');

module.exports = class extends Dependency {
    get dp() {
        return 'ts.dependency';
    }

    #declaration;
    get declaration() {
        return this.#declaration;
    }

    constructor(...params) {
        super(...params);
        this.#declaration = new (require('./declaration'))(this);
    }
}
