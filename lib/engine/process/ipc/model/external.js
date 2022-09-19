let model;
module.exports = m => (model = m) && External;

class External extends (require('./base')) {
    #external;

    get item() {
        return this.#external;
    }

    #application
    get application() {
        return this.#application;
    }

    #name;
    get name() {
        return this.#name;
    }


    async _initialise() {
        if (this._id.length !== 2) return this._done(`External id "${this.id}" is invalid`);

        const application = new model.Application(`application//${this._id[0]}`);
        await application.ready;
        if (application.error) return this._done(`External not valid, ${application.error}`);

        if (!application?.externals) return this._done(`External id "${this.id}" is invalid`);

        const promises = [];
        application.externals?.forEach(external => promises.push(external.ready));
        await Promise.all(promises);

        if (!application.externals.has(this._id[1])) return;

        this.#external = application.externals.get(this._id[1]);
        this.#application = application;

        this._done();
    };

    toJSON() {
        return {
            id: this.item.id,
            code: this.item.dts,
            processed: this.item.processed,
            errors: this.item.errors,
            warnings: this.item.warnings ?? []
        }
    }
}
