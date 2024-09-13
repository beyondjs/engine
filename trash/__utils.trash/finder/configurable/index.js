const Files = require('../files');
const DynamicProcessor = require('../../dynamic-processor')(Files);
const Finder = (require('../finder'));

module.exports = class extends DynamicProcessor {
    get dp() {
        return 'utils.configurable-finder';
    }

    #watcher;

    constructor(watcher) {
        if (!watcher) throw new Error('Invalid parameters');
        super();
        this.#watcher = watcher;
    }

    #finder;

    get _finder() {
        return this.#finder;
    }

    get path() {
        return this.#finder?.path;
    }

    get specs() {
        return this.#finder?.specs;
    }

    get filename() {
        return this.#finder?.filename;
    }

    get extname() {
        return this.#finder?.extname;
    }

    get errors() {
        return this.#finder ? this.#finder.errors : [];
    }

    get warnings() {
        return this.#finder ? this.#finder.warnings : [];
    }

    get missing() {
        return this.#finder ? this.#finder.missing : [];
    }

    #onFileChanged = file => {
        this._events.emit('file.change', file);
    }

    #previous;

    configure(path, specs) {
        if (this.destroyed) throw new Error('Configurable finder is destroyed');
        if (!path && specs) throw new Error('Invalid parameters');

        const {equal} = global.utils;
        const config = {path: path, specs: specs};
        if (equal(this.#previous, config)) return;
        this.#previous = config;

        // The configuration has been changed.
        // The .create() method is responsible for eliminating the previous finder if it exists.
        this.children.has('finder') && this.children.unregister(['finder']);
        this.#finder?.destroy();
        this.#finder = void 0;
        if (!path) {
            this._invalidate();
            return;
        }

        super.reset(path);
        this.#finder = new Finder(path, specs, this.#watcher);
        this.children.register(new Map([['finder', {child: this.#finder}]]));
        this.#finder.on('file.change', this.#onFileChanged);
        this._invalidate();
    }

    _process() {
        this.clear();
        this.#finder?.files.forEach(file => this.push(file));
    }

    destroy() {
        super.destroy();
        this.#finder?.destroy();
    }
}
