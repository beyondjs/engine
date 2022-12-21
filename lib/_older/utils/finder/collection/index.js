const ConfigurableFinder = require('../configurable');
const DynamicProcessor = require('../../dynamic-processor')(Map);

class FinderCollection extends DynamicProcessor {
    get dp() {
        return 'utils.finder-collection';
    }

    #finder;
    #Item;

    get watcher() {
        return this.#finder.watcher;
    }

    get path() {
        return this.#finder.path;
    }

    get specs() {
        return this.#finder.specs;
    }

    get filename() {
        return this.#finder.filename;
    }

    get extname() {
        return this.#finder.extname;
    }

    get errors() {
        return this.#finder.errors;
    }

    get warnings() {
        return this.#finder.warnings;
    }

    get missing() {
        return this.#finder.missing;
    }

    // Ordered array of collection keys
    #ordered = [];
    get ordered() {
        return this.#ordered;
    }

    /**
     * FinderCollection constructor
     *
     * @param watcher {object} The fs watcher
     * @param Item {object} The collection item
     */
    constructor(watcher, Item) {
        super();
        this.#Item = Item;

        if (!Item) throw new Error('Parameter Item is required');
        if (watcher && !(watcher instanceof global.utils.watchers.BackgroundWatcher)) {
            throw new Error('watcher parameter is not a valid background watcher');
        }

        this.#finder = new ConfigurableFinder(watcher);
        super.setup(new Map([['finder', {child: this.#finder}]]));
        this.#finder.on('file.change', this.#onFileChanged);
    }

    getKey(file) {
        const normalize = file => file.replace(/\\/g, '/')
            .replace(/\/$/, ''); // Remove trailing slash

        const key = this.filename ? file.relative.dirname : file.relative.file;
        return normalize(key);
    }

    #onFileChanged = (file) => {
        const key = this.getKey(file);
        if (!this.has(key)) return;
        const item = this.get(key);
        typeof item.fileChanged === 'function' && item.fileChanged();
    }

    /**
     * Access to the .has(key) method of the items map
     *
     * @param file {object | string}
     */
    has(file) {
        if (!this.path) return false;
        if (super.has(file)) return super.has(file);
        const key = this.getKey(this.#finder._getFileObject(file));
        return super.has(key);
    }

    /**
     * Access to the .get(key) method of the items map
     *
     * @param file {object | string}
     */
    get(file) {
        if (!this.path) return;
        if (super.has(file)) return super.get(file);
        const key = this.getKey(this.#finder._getFileObject(file));
        return super.get(key);
    }

    _process() {
        const updated = new Map();
        const ordered = [];
        this.#finder.forEach(file => {
            const key = this.getKey(file);
            ordered.push(key);

            let item = this.has(key) ? this.get(key) : new this.#Item(this, file);
            updated.set(key, item);
        });

        // Destroy the resources that are not currently in the collection
        this.forEach((item, key) => !updated.has(key) && item.destroy());

        super.clear(); // Do not use this.clear, as it will destroy all the previously created items
        updated.forEach((item, key) => this.set(key, item));

        // The assignment of #ordered must be done at the end of the method, because this property is used
        // by the forEach of the collection, which in turn is used by the current method
        this.#ordered = ordered;
    }

    configure(path, specs) {
        this.#finder.configure(path, specs);
    }

    // forEach must respect the order of the files arranged by the finder
    forEach(callback) {
        this.#ordered.forEach(key => callback(super.get(key), key));
    }

    entries() {
        const entries = [];
        this.#ordered.forEach(key => entries.push([key, super.get(key)]));
        return entries.values();
    };

    [Symbol.iterator] = () => {
        return this.entries();
    };

    keys() {
        const keys = [];
        this.#ordered.forEach(key => keys.push(key));
        return keys.values();
    }

    values() {
        const values = [];
        this.#ordered.forEach(key => values.push(super.get(key)));
        return values.values();
    }

    clear() {
        this.#ordered.length = 0;
        this.forEach(item => item.destroy());
        return super.clear();
    }

    destroy() {
        super.destroy();
        this.clear();
        this.#finder.destroy();
    }
}

FinderCollection.Item = require('./item');
module.exports = FinderCollection;
