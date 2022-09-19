const Files = require('../files');
const DynamicProcessor = require('../../dynamic-processor')(Files);
const Finder = (require('../finder'));

/**
 * Bridge to the finder instance
 */
module.exports = class extends DynamicProcessor {
    get dp() {
        return 'utils.configurable-finder';
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

    // This method is overridden in the index.js file
    _onChanged(file, reason) {
        void (file);
        void (reason);
    }

    // This method is overridden in the index.js file
    _onFileChanged(file) {
        void (file);
    }

    #onChanged = (...params) => this._onChanged(...params);
    #onFileChanged = (...params) => this._onFileChanged(...params);

    _create(watcher, path, specs) {
        this._delete();
        super.reset(path);
        this.#finder = new Finder(path, specs, watcher);
        this.#finder.on('change', this.#onChanged);
        this.#finder.on('file.change', this.#onFileChanged);
    }

    _delete() {
        this.#finder && this.#finder.destroy();
        this.#finder = undefined;
    }

    destroy() {
        super.destroy();
        this._delete();
    }
}
