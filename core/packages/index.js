const DynamicProcessor = require('beyond/utils/dynamic-processor');
const Internals = require('./internals');
const Externals = require('./externals');
const equal = require('beyond/utils/equal');

module.exports = class extends DynamicProcessor(Map) {
    get dp() {
        return 'packages';
    }

    #warnings = [];
    get warnings() {
        return this.#warnings;
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
        const warnings = [];
        let changed = false;

        const set = (pkg, is) => {
            if (is === 'internal' && !pkg.valid) {
                warnings.push(`Package "${pkg.path}" is invalid: ${JSON.stringify(pkg.errors)}`);
                return;
            }

            const {vspecifier} = pkg;
            !this.has(vspecifier) && (changed = true) && updated.set(vspecifier, pkg);
        }

        this.#externals.forEach(pkg => set(pkg, 'external'));
        this.#internals.forEach(pkg => set(pkg, 'internal'));

        changed = changed || !equal(this.#warnings, warnings);
        this.#warnings = warnings;

        this.clear();
        changed = changed || [...this.keys()].reduce((vspecifier, prev) => prev || !updated.has(vspecifier), false);
        updated.forEach((value, key) => this.set(key, value));

        return changed;
    }
}
