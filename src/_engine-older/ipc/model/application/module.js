let model;
module.exports = m => (model = m) && ApplicationModule;

class ApplicationModule extends require('../base') {
    #item;
    get item() {
        return this.#item;
    }

    get module() {
        return this.item.module;
    }

    get pathname() {
        return this.#item.pathname;
    }

    #application;
    get application() {
        return this.#application;
    }

    get container() {
        return this.#item.container;
    }

    get bundles() {
        return this.#item?.bundles;
    }

    async _initialise() {
        if (this._id.length < 2) return this._done(`Application id "${this.id}" is invalid`);

        const application = new model.Application(this._id.slice(0, 2));
        await application.ready;
        if (application.error) return this._done(`ApplicationModule not valid, ${application.error}`);

        await application.modules.ready;
        const item = [...application.modules.values()].find(item => item.id === this.id);
        if (!item) return this._done(`ApplicationModule id "${this.id}" not found`);

        this.#item = item;
        this.#application = application;

        this._done();
    };
}
