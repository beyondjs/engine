const DynamicProcessor = require('beyond/utils/dynamic-processor');
const Internals = require('./internals');
const Externals = require('./externals');

module.exports = class extends DynamicProcessor(Map) {
    get dp() {
        return 'packages';
    }

    #internals;
    get internals() {
        return this.#internals;
    }

    #externals;
    get externals() {
        return this.#externals;
    }

    constructor(config) {
        super();
        const internals = this.#internals = new Internals(this, config);
        const externals = this.#externals = new Externals(this);
        super.setup(new Map([['internals', {child: internals}], ['externals', {child: externals}]]));

        this.ready; // Auto-initialise packages collection
    }

    _prepared(require) {
        this.#internals.forEach(pkg => require(pkg));
    }

    _process() {
        const updated = new Map();
        let changed = false;

        const set = pkg => {
            const {id} = pkg;
            !this.has(id) && (changed = true) && updated.set(id, pkg);
        }

        this.#externals.forEach(pkg => set(pkg));
        this.#internals.forEach(pkg => set(pkg));

        this.clear();
        changed = changed || [...this.keys()].reduce((vspecifier, prev) => prev || !updated.has(vspecifier), false);
        updated.forEach((value, key) => this.set(key, value));

        return changed;
    }

    find(specs) {
        if (!specs) throw new Error('Invalid parameters, specification is undefined');
        if (!specs.vspecifier) throw  new Error('Invalid parameters');

        return [...this.values()].find(({vspecifier}) => vspecifier === specs.vspecifier);
    }
}
