let model;
module.exports = m => (model = m) && LibraryStatic;

class LibraryStatic extends require('../base') {
    #item;

    get static() {
        return this.#item;
    }

    #library;
    get library() {
        return this.#library;
    }

    async _initialise() {
        if (this._id.length < 2) return this._done(`Library id "${this.id}" is invalid`);

        const library = new model.Library(this._id.slice(0, 2));
        await library.ready;
        if (library.error) return this._done(`LibraryStatic not valid, ${library.error}`);

        await library.static.ready;
        const item = [...library.static.values()].find(item => item.id === this.id);

        if (!item) return
        this.#item = item;
        this.#library = library;

        this._done();
    };
}
