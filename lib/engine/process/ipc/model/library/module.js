let model;
module.exports = m => (model = m) && LibraryModule;

class LibraryModule extends require('../base') {
    #item;
    get item() {
        return this.#item;
    }

    #library;
    get library() {
        return this.#library;
    }

    get module() {
        return this.#item.module;
    }

    async _initialise() {
        if (this._id.length < 2) return this._done(`Library id "${this.id}" is invalid`);

        const library = new model.Library(this._id.slice(0, 2));
        await library.ready;
        if (library.error) return this._done(`LibraryModule not valid, ${library.error}`);

        await library.modules.ready;
        const item = [...library.modules.values()].find(item => item.id === this.id);
        if (!item) return this._done(`LibraryModule id "${this.id}" not found`);

        this.#item = item;
        this.#library = library;

        this._done();
    };
}
