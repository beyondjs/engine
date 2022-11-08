const Bundles = require('./bundles');

module.exports = class extends require('./attributes') {
    #bundles;
    get bundles() {
        return this.#bundles;
    }

    constructor(pkg, subpath) {
        super(pkg, subpath);
        this.#bundles = new Bundles(this);
    }

    destroy() {
        super.destroy();
        this.#bundles.destroy();
    }
}
