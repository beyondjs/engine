module.exports = class {
    #model;

    constructor(model) {
        this.#model = model;
    }

    async get(applicationId, distribution) {
        if (!distribution.local) throw new Error('Distribution is invalid, .local property should be true');

        // The imports must be a Map and it is received as an array of entries to be able to be serialized through IPC
        distribution.imports = new Map(distribution.imports);

        const application = await require('../application')(this.#model.core, applicationId);
        const config = application.config.get(distribution);
        await config.ready;

        const {errors, code} = config;
        return {errors, code};
    }
}
