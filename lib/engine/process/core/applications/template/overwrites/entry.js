const {EventEmitter} = require('events');
const {equal} = global.utils;

/**
 * An entry is an object that specifies the overwrites of a container,
 * both to overwrite the static files and its bundles.
 * The container can be either a module, a library, or an application.
 *
 * The statics file overwriting specification is an object whose key
 * is the file being overwritten and the value is the file path relative to the overwrite path.
 * In the case of the bundles overwrites, their configuration is an object
 * whose key is the processor name and the value is the processor configuration.
 * The bundles (in their registry) can specify that the overwriting configuration
 * is actually a single processor configuration.
 *
 * For example, the "txt" bundle specify that its overwrites are only one processor, and therefore
 * the bundles "txt" are specified in the following way:
 * "module_id": {files: ["texts.json]} and they are internally converted to:
 * "module_id": {"txt": {files: ["texts.json]}
 */
module.exports = class extends EventEmitter {
    get dp() {
        return 'application.template.overwrites.entry';
    }

    #key;
    get key() {
        return this.#key;
    }

    #path;
    get path() {
        return this.#path;
    }

    #config = {};
    get config() {
        return this.#config;
    }

    // The entry is considered ready when the overwrites configuration is ready
    #ready = Promise.pending();
    get ready() {
        return this.#ready;
    }

    // Although this class does not need to be initialized,
    // the following method is required to implement the DynamicProcessor interface
    initialise = () => void (0);

    // initialised is true once the entry is configured
    #initialised = false;
    get initialised() {
        return this.#initialised;
    }

    get initialising() {
        return false;
    }

    // processed is true once the entry is configured
    get processed() {
        return this.#initialised;
    }

    #destroyed = false;
    get destroyed() {
        return this.#destroyed;
    }

    constructor(key) {
        super();
        this.#key = key;
    }

    configure(path, config) {
        const done = (changed = true) => {
            const initialised = this.#initialised;
            this.#initialised = true;
            !initialised && this.#ready.resolve();
            initialised && changed && this.emit('change');
            !initialised && this.emit('initialised');
        }

        if (path === this.#path && equal(config, this.#config)) return done(false);

        this.#path = path;
        this.#config = config;
        done();
    }

    destroy() {
        if (this.#destroyed) throw new Error('Object is already destroyed');
        this.#destroyed = true;
        this.removeAllListeners();
    }
}
