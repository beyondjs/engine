const DynamicProcessor = require('beyond/utils/dynamic-processor');
const Internals = require('./internals');
const Externals = require('./externals');

module.exports = new class extends DynamicProcessor(Map) {
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

    /**
     * Initialise the packages according they are configured in the beyond.json file
     * @param config {*}
     * @param specs {watchers: {boolean}}
     */
    setup(config, specs) {
        const internals = this.#internals = new Internals(config, specs);
        const externals = this.#externals = new Externals();
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
        changed = changed || [...this.keys()].reduce((vname, prev) => prev || !updated.has(vname), false);
        updated.forEach((value, key) => this.set(key, value));

        return changed;
    }

    find(specs) {
        if (!specs) throw new Error('Invalid parameters, specification is undefined');
        if (!specs.vname && !specs.name) throw  new Error('Invalid parameters');

        if (specs.vname) {
            return [...this.values()].find(({vname}) => vname === specs.vname);
        }
        else if (specs.name) {
            const packages = [...this.values()].filter(({name}) => name === specs.name);
            const versions = packages.map(({version}) => version);
            return new Set(versions);
        }
    }

    destroy() {
        this.#internals.destroy();
        this.#externals.destroy();
    }
}
