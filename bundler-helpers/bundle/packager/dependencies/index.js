const DynamicProcessor = require('beyond/utils/dynamic-processor');
const ipc = require('beyond/utils/ipc');

module.exports = class extends DynamicProcessor(Map) {
    get dp() {
        return 'bundler.bundle.dependencies';
    }

    /**
     * The bundle packager
     */
    #packager;
    get packager() {
        return this.#packager;
    }

    #Dependency;

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

        const {cspecs: {platform}, bundle} = this.#packager;
        const importer = bundle.module.pkg.vspecifier;
        return new this.#Dependency(specifier, importer, platform);
    }

    _notify() {
        ipc.notify('data-notification', {
            type: 'list/update',
            table: 'bundle-dependencies',
            filter: {bundle: this.#packager.id}
        });
    }

    #added;

    add(specifier, is) {
        this.#added.add(specifier, is);
    }

    /**
     * Packager dependencies constructor
     *
     * @param packager {*} The bundle packager
     * @param Dependency= {*} The Dependency class used as the Item of the collection
     */
    constructor(packager, Dependency) {
        super();
        this.#packager = packager;
        this.#Dependency = Dependency ? Dependency : require('../../../dependencies/dependency');
        this.#hash = new (require('./hash'))(this);
        this.#code = new (require('../../../dependencies/code'))(this, packager);
        this.#added = new (require('./added'))(this);

        super.setup(new Map([
            ['hash', {child: packager.processors.hashes.dependencies}],
            ['deprecated-imports', {child: packager.bundle.imports}]
        ]));
    }

    _prepared() {
        // All bundles depends on @beyond-js/kernel/bundle, except itself
        this.#packager.bundle.specifier !== '@beyond-js/kernel/bundle' && this.#added.add('@beyond-js/kernel/bundle');
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

        this.#packager.processors.forEach(({dependencies}) => {
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

        // Destroy unused processors
        this.forEach((dependency, specifier) => !updated?.has(specifier) && dependency.destroy());

        super.clear(); // Do not use this.clear() as it would destroy still used processors
        updated?.forEach((value, key) => this.set(key, value));
    }
}
