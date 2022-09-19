/**
 * The children of the compiler are not disposed at startup,
 * since the processed data can be loaded from the cache
 */
module.exports = class {
    #compiler;
    get compiler() {
        return this.#compiler;
    }

    #disposed = false;
    get disposed() {
        return this.#disposed;
    }

    constructor(compiler) {
        this.#compiler = compiler;
    }

    _get(child) {
        if (!this.#disposed) throw new Error('Children not disposed');
        return this.#compiler.children.get(child)?.child;
    }

    get dependencies() {
        return this._get('dependencies');
    }

    get options() {
        return this._get('options');
    }

    get analyzer() {
        return this._get('analyzer');
    }

    get files() {
        return this._get('files');
    }

    get extensions() {
        return this._get('extensions');
    }

    get extended() {
        return this._get('extended');
    }

    get overwrites() {
        return this._get('overwrites');
    }

    /**
     * When the processor is updated, the data is taken from the cache, otherwise the children must be set.
     * This method can be overridden.
     *
     * @param children? {Map<string, object>} Used by the overridden method to set extra children
     */
    dispose(children) {
        if (this.#disposed) return;
        this.#disposed = true;

        const {processor} = this.#compiler.packager;
        const {analyzer, sources, options, meta, dependencies} = processor;

        children = children ? children : new Map();
        options && children.set('options', {child: options});

        dependencies && children.set('dependencies', {child: dependencies});

        if (analyzer) {
            children.set('analyzer', {child: analyzer});
        }
        // If the compiler doesn't have an analyzer, then take the sources from the sources object
        else {
            const {files, extensions, overwrites} = sources;

            const events = ['item.initialised', 'item.change'];
            children.set('files', {child: files, events});
            children.set('extensions', {child: extensions, events});
            overwrites && children.set('overwrites', {child: overwrites, events});
        }

        const extended = meta.extender ? new (require('./extended'))(processor) : void 0;
        extended && children.set('extended', {child: extended});

        this.#compiler.children.register(children);
    }
}
