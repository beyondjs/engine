let model;
module.exports = m => (model = m) && Distribution;

class Distribution extends (require('./base')) {
    #distribution;

    get item() {
        return this.#distribution;
    }

    #application;
    get application() {
        return this.#application;
    }

    async _initialise() {
        if (this._id < 2) return this._done(`Distribution id "${this.id}" is invalid`);

        const application = new model.Application(`application//${this._id[0]}`);
        await application.ready;
        if (application.error) return this._done(`Application "${this._id[0]}" not valid`);
        await application.deployment.ready;
        await application.deployment.distributions.ready;

        const distributions = application.deployment.distributions;
        this.#distribution = [...distributions.values()].find(distribution => this.id === distribution.id);
        if (!this.#distribution) return this._done(`Distribution "${this.id}" not found`);

        this.#application = application;

        this._done();
    };

    toJSON() {
        return {
            id: this.item.id,
            key: 'dashboard',
            name: this.item.name,
            ts: this.item.ts,
            platform: this.item.platform
        };
    }
}
