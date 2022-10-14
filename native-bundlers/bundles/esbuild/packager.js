module.exports = class {
    #bundle;
    get bundle() {
        return this.#bundle;
    }

    #cspecs;
    get cspecs() {
        return this.#cspecs;
    }

    get id() {
        const ckey = this.#cspecs.key();
        return `${this.#bundle.id}//${ckey}`;
    }

    #js;
    get js() {
        return this.#js;
    }

    #declaration;
    get declaration() {
        return this.#declaration;
    }

    #hash;
    get hash() {
        return this.#hash;
    }

    #dependencies;
    get dependencies() {
        return this.#dependencies;
    }

    #consumers;
    get consumers() {
        return this.#consumers;
    }

    constructor(bundle, cspecs) {
        this.#bundle = bundle;
        this.#cspecs = cspecs;

        super.setup(new Map([['bundle', {child: bundle}]]));

        this.#js = new (require('./js'))();
    }
}
