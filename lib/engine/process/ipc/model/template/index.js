let model;
module.exports = m => (model = m) && Template;

class Template extends require('../base') {
    #template;
    #application;

    get item() {
        return this.#template;
    }

    get id() {
        return this.#application.item.id;
    }

    get application() {
        return this.#template.application;
    }

    get overwrites() {
        return this.#template.overwrites;
    }

    get processors() {
        return this.#template.processors;
    }

    get global() {
        return this.#template.global;
    }

    get path() {
        return this.#template.path;
    }

    get errors() {
        return this.#template.errors;
    }

    get warnings() {
        return this.#template.warnings;
    }

    async _initialise() {
        if (this._id.length !== 2) return this._done(`Application id "${this._id.join('//')}" is invalid`);

        const application = new model.Application(this._id);
        await application.ready;
        if (application.error) return this._done(`Template not valid, ${application.error}`);

        await application.template.ready;
        this.#application = application;
        this.#template = application.template;

        this._done();
    };
}