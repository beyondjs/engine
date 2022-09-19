module.exports = class extends global.Dependency {
    get dp() {
        return 'sass.dependency';
    }

    #files;
    get files() {
        return this.#files;
    }

    constructor(resource, processor) {
        super(resource, processor);
        resource !== '@beyond-js/kernel/styles' && (this.#files = new (require('./files'))(this));
    }
}
