let model;
module.exports = m => (model = m) && Application;

class Application extends require('../base') {
    #application;

    get item() {
        return this.#application;
    }

    get builder() {
        return this.#application?.builder;
    }

    get modules() {
        return this.#application?.modules;
    }

    get libraries() {
        return this.#application?.libraries;
    }

    get static() {
        return this.#application?.static;
    }

    get template() {
        return this.#application?.template;
    }

    get dependencies() {
        return this.#application?.dependencies;
    }

    get declarations() {
        return this.#application?.declarations;
    }

    get externals() {
        return this.#application?.externals;
    }

    get deployment() {
        return this.#application?.deployment;
    }

    async _initialise() {
        if (this._id.length < 2) return this._done(`Application id "${this._id.join('//')}" is invalid`);

        const id = parseInt(this._id[1]);
        const {applications} = model.core;
        await applications.ready;

        const application = [...applications.values()].find(item => item.id === id);
        if (!application) return this._done(`Application id "${this._id.join('//')}" not found`);

        await application.ready;
        this.#application = application;

        this._done();
    };

    toJSON() {
        const errors = this.formatErrors(this.#application.errors, 'application');
        return {
            id: this.#application.id,
            path: this.#application.path,
            scope: this.#application.scope,
            name: this.#application.name,
            specifier: this.#application.specifier,
            vspecifier: this.#application.vspecifier,
            title: this.#application.title,
            description: this.#application.description,
            developer: this.#application.developer,
            modulesPath: this.#application.modules.self.path,
            version: this.#application.version,
            hosts: this.#application.hosts,
            errors: errors,
            warnings: this.#application.warnings ?? []
        };
    }
}