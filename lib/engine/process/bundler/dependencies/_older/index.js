const {ipc, equal} = global.utils;
const DynamicProcessor = global.utils.DynamicProcessor(Map);

/**
 * This is an abstract class inherited by
 * . bundle/bundle/packager/dependencies
 * . bundle/transversal/packager/dependencies
 * . processor/base
 */
module.exports = class extends DynamicProcessor {
    get dp() {
        return 'bundler.dependencies';
    }

    _notify() {
        if (this.container.is === 'transversalPackager') return
        let table = this.container.is === 'bundlePackager' ? 'bundle-dependencies' : 'processors-dependencies';

        let id = this.container.id.split('//');
        id = id.slice(0, id.length - 2).join('//');
        ipc.notify('data-notification', {
            type: 'list/update',
            table: table,
            filter: {processor: id}
        });
    }

    /**
     * #container {object} Can be:
     *   . a processor
     *   . a bundle packager
     *   . a transversal packager
     */
    #container;
    get container() {
        return this.#container;
    }

    #Dependency;
    #propagator;

    get hashes() {
        return this.children.get('hashes').child;
    }

    // The last processed sources hash. Used to be able to compare it with the current hash of the processor
    // and thus know if the dependencies are up-to-date.
    #processedHash;
    #cache;

    // The code is required by both the bundle and the transversal
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

    _create(resource) {
        if (this.has(resource)) throw new Error(`Dependency "${resource}" already created`);
        return new this.#Dependency(resource, this.#container);
    }

    constructor(container, hash, Dependency, Propagator) {
        super();
        this.#container = container;
        this.#Dependency = Dependency ? Dependency : require('./dependency');
        this.#cache = new (require('./cache'))(this);

        super.setup(new Map([['hash', {child: hash}]]));

        this.#code = new (require('./code'))(this, container);

        Propagator = Propagator ? Propagator : require('./propagator');
        this.#propagator = new Propagator(this._events);
    }

    async _begin() {
        const cached = await this.#cache.load();
        if (cached) {
            this.hydrate(cached);
            this.#propagator.subscribe([...this.values()]);
        }
    }

    get updated() {
        const {hash} = this;
        return hash.value === this.#processedHash;
    }

    _save() {
        this.#cache.save();
    }

    _process() {
        if (this.updated) return false;

        this.forEach(({is}) => is.clear());
        const {errors, updated} = this._update();

        let changed = !equal(errors, this.#errors);
        this.#errors = errors;

        changed = changed || (updated ? updated.size : 0 !== this.size);
        changed = changed || !![...this.values()].find(({resource}) => !updated.has(resource));

        // Subscribe modules that are new to the collection
        updated && this.#propagator.subscribe([...updated.values()].filter(dependency => !this.has(dependency.resource)));

        // Unsubscribe unused modules
        this.#propagator.unsubscribe([...this.values()].filter(dependency => !updated?.has(dependency.resource)));

        // Destroy unused processors
        this.forEach((dependency, resource) => !updated?.has(resource) && dependency.destroy());

        super.clear(); // Do not use this.clear() as it would destroy still used processors
        updated?.forEach((value, key) => this.set(key, value));

        this.#processedHash = this.hash.value;
        changed && this._save();

        return changed;
    }

    clear() {
        this.forEach(dependency => dependency.destroy());
    }

    destroy() {
        super.destroy();
        this.clear();
    }

    hydrate(cached) {
        this.#processedHash = cached.hash;
        this.#errors = cached.errors;

        const dependencies = new Map(cached.dependencies);
        dependencies.forEach((data, resource) => {
            const dependency = this._create(resource);
            dependency.hydrate(data);
            this.set(resource, dependency);
        });
    }

    toJSON() {
        return {hash: this.#processedHash, dependencies: [...this], errors: this.errors};
    }
}
