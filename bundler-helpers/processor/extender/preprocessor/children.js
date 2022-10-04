/**
 * The children of the preprocessor are not disposed at startup,
 * since the processed data can be loaded from the cache
 */
module.exports = class {
    #preprocessor;
    get preprocessor() {
        return this.#preprocessor;
    }

    #disposed = false;

    constructor(preprocessor) {
        this.#preprocessor = preprocessor;
    }

    _get(child) {
        if (!this.#disposed) throw new Error('Children not disposed');
        return this.#preprocessor.children.get(child)?.child;
    }

    get analyzer() {
        return this._get('analyzer');
    }

    get files() {
        return this._get('files');
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

        const {processor} = this.#preprocessor;
        const {analyzer, sources} = processor;

        children = children ? children : new Map();

        // If children of the preprocessor can be the analyzer, if it exists, or the processor sources
        if (analyzer) {
            children.set('analyzer', {child: analyzer});
        }
        else {
            const {files, overwrites} = sources;
            children.set('files', {child: files});
            overwrites && children.set('overwrites', {child: overwrites});
        }

        this.#preprocessor.children.register(children);
    }
}
