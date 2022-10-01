const {ipc} = global.utils;
const DynamicProcessor = global.utils.DynamicProcessor(Map);

module.exports = class extends DynamicProcessor {
    get dp() {
        return 'bundler.bundle.dependencies';
    }

    /**
     * The bundle packager
     */
    #bp;
    get bp() {
        return this.#bp;
    }

    #Dependency;
    #propagator;

    #hash;
    get hash() {
        return this.#hash;
    }

    #code;
    get code() {
        return this.#code;
    }

    #errors;
    get errors() {
        return this.#errors ? this.#errors : [];
    }

    get valid() {
        return this.processed && !this.errors.length;
    }

    _create(specifier) {
        if (this.has(specifier)) throw new Error(`Dependency "${specifier}" already created`);
        return new this.#Dependency(specifier, this.#bp);
    }

    _notify() {
        ipc.notify('data-notification', {
            type: 'list/update',
            table: 'bundle-dependencies',
            filter: {bundle: this.#bp.id}
        });
    }

    #added;

    add(specifier, is) {
        this.#added.add(specifier, is);
    }

    /**
     * Packager dependencies constructor
     *
     * @param bp {*} The bundle packager
     * @param Dependency {*} The Dependency class
     * @param Propagator {*} The Propagator of events
     */
    constructor(bp, Dependency, Propagator) {
        super();
        this.#bp = bp;
        this.#Dependency = Dependency ? Dependency : require('../../../dependencies/dependency');
        this.#hash = new (require('./hash'))(this);
        this.#code = new (require('../../../dependencies/code'))(this, bp);
        this.#added = new (require('./added'))(this);

        super.setup(new Map([
            ['hash', {child: bp.processors.hashes.dependencies}],
            ['deprecated-imports', {child: bp.bundle.imports}]
        ]));

        Propagator = Propagator ? Propagator : require('../../../dependencies/propagator');
        this.#propagator = new Propagator(this._events);
    }

    _prepared() {
        // All bundles depends on @beyond-js/kernel/bundle, except itself
        this.bp.bundle.specifier !== '@beyond-js/kernel/bundle' && this.#added.add('@beyond-js/kernel/bundle');
    }

    _process() {
        this.forEach(dependency => dependency.clear());

        const errors = [], updated = new Map();

        const add = (specifier, is) => {
            const dependency = this.has(specifier) ? this.get(specifier) : this._create(specifier);
            is.forEach(type => dependency.is.add(type));
            updated.set(specifier, dependency);
        }

        this.#added.forEach((is, specifier) => add(specifier, is));

        this.#bp.processors.forEach(({dependencies}) => {
            dependencies?.forEach(({valid, specifier, is}) => {
                if (!valid) {
                    errors.push(`Dependency "${specifier}" is invalid`);
                    return;
                }

                add(specifier, is);
            });
        });

        const imports = this.children.get('deprecated-imports').child;
        [...imports.keys()].forEach(specifier => add(specifier, ['import']));

        this.#errors = errors;

        // Subscribe modules that are new to the collection
        updated && this.#propagator.subscribe([...updated.values()].filter(dependency => !this.has(dependency.specifier)));

        // Unsubscribe unused modules
        this.#propagator.unsubscribe([...this.values()].filter(dependency => !updated?.has(dependency.specifier)));

        // Destroy unused processors
        this.forEach((dependency, specifier) => !updated?.has(specifier) && dependency.destroy());

        super.clear(); // Do not use this.clear() as it would destroy still used processors
        updated?.forEach((value, key) => this.set(key, value));
    }
}
