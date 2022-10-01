module.exports = class extends require('../property') {
    get is() {
        return 'array';
    }

    errors() {
        return super.errors.concat(this.#items.errors);
    }

    #items;
    get items() {
        return this.#items;
    }

    constructor(path, branchesSpecs, branch, parent) {
        super(path, branchesSpecs, branch, parent);
        this.#items = new (require('./items'))(this);
    }

    _process() {
        if (super._process() === false) return false;
        return this.#items.update();
    }

    destroy() {
        super.destroy();
        this.#items.destroy().catch(exc => console.error(exc.stack));
    }
}
