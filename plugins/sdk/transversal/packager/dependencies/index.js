const DynamicProcessor = require('beyond/utils/dynamic-processor');
const ipc = require('beyond/utils/ipc');

module.exports = class extends DynamicProcessor(Map) {
    get dp() {
        return 'bundler.transversal.dependencies';
    }

    // The transversal packager
    #tp;
    get tp() {
        return this.#tp;
    }

    #Dependency;
    #bundles;

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
        return new this.#Dependency(specifier, this.#tp);
    }

    _notify() {
        ipc.notify('data-notification', {
            type: 'list/update',
            table: 'transversal-dependencies',
            filter: {transversal: this.#tp.id}
        });
    }

    #added;

    add(specifier, is) {
        this.#added.add(specifier, is);
    }

    /**
     * The transversal packager dependencies constructor
     *
     * @param tp {object} The transversal packager
     * @param bundles {object} The bundles packagers
     * @param Dependency= {object} An specialized Dependency class
     */
    constructor(tp, bundles, Dependency) {
        super();
        this.#tp = tp;
        this.#bundles = bundles;
        this.#Dependency = Dependency ? Dependency : require('../../../dependencies/dependency');
        this.#hash = new (require('./hash'))(bundles);
        this.#code = new (require('../../../dependencies/code'))(this, tp);
        this.#added = new (require('./added'))(this);
    }

    _prepared(require) {
        if (!this.children.has('bundles')) {
            this.setup(new Map([['bundles', {child: this.#bundles}]]));
            if (!require(this.#bundles)) return;
        }

        this.#bundles.forEach(({dependencies}) => {
            dependencies && require(dependencies) && dependencies.forEach(dependency => require(dependency))
        });
    }

    _process() {
        this.forEach(dependency => dependency.clear());

        const errors = [], updated = new Map();

        this.#added.forEach((is, specifier) => {
            const dependency = this.has(specifier) ? this.get(specifier) : this._create(specifier);
            is.forEach(type => dependency.is.add(type));
            updated.set(specifier, dependency);
        });

        const bundles = this.children.get('bundles').child;
        bundles.forEach(({dependencies: d}) => d?.forEach(({specifier, is}) => {
            const dependency = this.has(specifier) ? this.get(specifier) : this._create(specifier);
            is.forEach(type => dependency.is.add(type));
            updated.set(specifier, dependency);
        }));

        this.#errors = errors;

        // Destroy unused processors
        this.forEach((dependency, specifier) => !updated?.has(specifier) && dependency.destroy());

        super.clear(); // Do not use this.clear() as it would destroy still used processors
        updated?.forEach((value, key) => this.set(key, value));
    }
}
