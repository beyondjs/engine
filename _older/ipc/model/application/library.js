let model;
module.exports = m => (model = m) && ApplicationLibrary;

class ApplicationLibrary extends require('../base') {
    #item;
    get item() {
        return this.#item;
    }

    get library() {
        return this.#item.library;
    }

    #application;
    get application() {
        return this.#application;
    }

    async _initialise() {
        if (this._id.length < 2) return this._done(`ApplicationLibrary id "${this.id}" is invalid`);

        const application = new model.Application(`application//${this._id[0]}`);
        await application.ready;
        if (application.error) return this._done(`ApplicationLibrary not valid, ${application.error}`);

        await application.libraries.ready;
        const item = [...application.libraries.values()].find(item => item.id === this.id);
        if (!item) return this._done(`ApplicationLibrary id "${this.id}" not found`);

        await item.ready;
        this.#item = item;
        this.#application = application;

        this._done();
    };
}
