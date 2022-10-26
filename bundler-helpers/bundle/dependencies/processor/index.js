const DependencyBase = require('../../../dependencies/dependency');
const DependenciesCode = require('../../../dependencies/code');
const DependenciesAdded = require('./added');
const Hash = require('./hash');
const DynamicProcessor = require('beyond/utils/dynamic-processor');
const ipc = require('beyond/utils/ipc');

module.exports = class extends DynamicProcessor(Map) {
    get dp() {
        return 'bundle.dependencies';
    }

    #bundle;
    get bundle() {
        return this.#bundle;
    }

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

        const {cspecs: {platform}, bundle} = this.#pset;
        const importer = bundle.module.pkg.vspecifier;
        return new DependencyBase(specifier, importer, platform);
    }

    _notify() {
        ipc.notify('data-notification', {
            type: 'list/update',
            table: 'bundle-dependencies',
            filter: {bundle: this.#pset.bundle.id}
        });
    }

    #added;

    add(specifier, is) {
        this.#added.add(specifier, is);
    }

    constructor(bundle, platform, language) {
        super();
        this.#bundle = bundle;
        this.#id = `${bundle.id}//${platform}` + (language ? `//${language}` : '');
        this.#platform = platform;
        this.#language = language;

        this.#pset = bundle.psets.get(platform, false, language);
        this.#added = new DependenciesAdded(this);
        this.#hash = new Hash(this);
        this.#code = new DependenciesCode(this, this.#pset);

        super.setup(new Map([
            ['hash', {child: this.#pset.processors.hashes.dependencies}],
            ['deprecated-imports', {child: bundle.imports}]
        ]));
    }

    _prepared() {
        // All bundles depends on @beyond-js/kernel/bundle, except itself
        const bkb = '@beyond-js/kernel/bundle';
        this.#pset.bundle.specifier !== bkb && this.#added.add(bkb);
    }

    _process() {
        const errors = [], updated = new Map();
        this.forEach(dependency => dependency.clear());

        const add = (specifier, is) => {
            const dependency = this.has(specifier) ? this.get(specifier) : this._create(specifier);
            is.forEach(type => dependency.is.add(type));
            updated.set(specifier, dependency);
        }

        this.#added.forEach((is, specifier) => add(specifier, is));

        this.#pset.forEach(({dependencies}) => {
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

        this.forEach((dependency, specifier) => !updated?.has(specifier) && dependency.destroy());
        this.clear();
        updated?.forEach((value, key) => this.set(key, value));
    }

    destroy() {
        super.destroy();
        this.forEach(dependency => dependency.destroy());
        this.clear();
    }
}
