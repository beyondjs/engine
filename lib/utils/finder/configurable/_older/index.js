/**
 * The configurable finder allows settings to be changed dynamically.
 * Each configuration change involves creating a new finder and deleting the previous one.
 */
module.exports = class extends require('./bridge') {
    #watcher;
    get watcher() {
        return this.#watcher;
    }

    constructor(watcher) {
        if (!watcher) throw new Error('Invalid parameters');
        super();
        this.#watcher = watcher;
    }

    _onChanged(file, reason) {
        void (file);
        void (reason);
        this._invalidate();
    }

    _onFileChanged(file) {
        this._events.emit('file.change', file);
    }

    async _process(request) {
        await this._finder?.ready;
        if (this._request !== request) return;

        this.clear();
        this._finder?.files.forEach(file => this.push(file));
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
        path ? this._create(this.#watcher, path, specs) : super._delete();

        this._invalidate();
    }
}
