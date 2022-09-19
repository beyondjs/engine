let model;
module.exports = m => (model = m) && Application;

class Application extends require('../base') {
    #application;

    get item() {
        return this.#application;
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

        let port;
        this.#application.deployment.distributions.forEach(dist => {
            if (!dist.default) return;
            port = dist.ports ? dist.ports.bundles : dist.port;
        });

        const data = {
            id: this.#application.id,
            path: this.#application.path,
            name: this.#application.name,
            title: this.#application.title,
            description: this.#application.description,
            developer: this.#application.developer,
            modulesPath: this.#application.modules.self.path,
            version: this.#application.version,
            port: port,
            connect: this.#application.connect,
            hosts: this.#application.hosts,
            graph: this.#application.graph,
            errors: errors,
            warnings: this.#application.warnings ?? [],
            servers: []
        };

        // Iterate over application servers (the servers of the distributions of each application)
        model.http.forEach((servers, applicationId) => applicationId === this.item.id &&
            servers.forEach(server => data.servers.push(server.distribution.toJSON()))
        );

        return data;
    }
}