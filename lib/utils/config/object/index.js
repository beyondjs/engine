const equal = (require('../../equal'));

module.exports = class extends require('../property') {
    get is() {
        return 'object';
    }

    #properties;
    get properties() {
        return this.#properties;
    }

    has = (name) => this.#properties.has(name);
    get = (name) => this.#properties.get(name);

    constructor(path, branchesSpecs, branch, parent) {
        super(path, branchesSpecs, branch, parent);
        this.#properties = new (require('./properties'))(this);
    }

    /**
     * Check if the value of the current property has changed.
     * To find it out, it is required to remove the children from the received data,
     * since the children properties verify their own data.
     */
    _process() {
        let previous = this.value;
        if (super._process() === false) return false;

        previous = Object.assign({}, previous);
        const actual = Object.assign({}, this.value);

        [...this.branchesSpecs.keys()].forEach(branch => {
            if (!branch.startsWith(`${this.branch}/`)) return;
            const child = branch.substr(this.branch.length + 1).split('/')[0];
            delete previous[child];
            delete actual[child];
        });

        const changed = !equal(actual, previous);
        this.#properties.update();
        return changed;
    }

    destroy() {
        super.destroy();
        this.#properties.destroy();
    }
}
