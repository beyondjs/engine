module.exports = class extends global.Dependency {
    get dp() {
        return 'ts.dependency';
    }

    #declaration;
    get declaration() {
        return this.#declaration;
    }

    constructor(specifier, processor) {
        super(specifier, processor, require('./propagator'));
        this.#declaration = new (require('./declaration'))(this);
    }
}
