module.exports = class {
    #model;
    #typings;

    constructor(model) {
        this.#model = model;
        this.#typings = require('beyond/typings');
    }

    async get(ids) {
        if (!(ids instanceof Array)) throw new Error('Invalid parameters');
        if (!ids.length) return;

        //- get internal dependencies declarations
        const beyondDependencies = [];
        ids.forEach(id => id.includes('application//') && beyondDependencies.push(id));
        const bundles = new this.#model.Collection(this.#model.Bundle, beyondDependencies);
        await bundles.ready;

        const packagers = new Map();
        const applications = new Map();
        for (const bundle of bundles.values()) {
            const {application, platforms} = bundle.item.container;
            applications.set(application.id, application);
            const distribution = await this.#model.distribution(application.id, bundle, platforms);
            distribution && !bundle.error && packagers.set(bundle.id, bundle.packagers.get(distribution));
        }

        const promises = [];
        packagers.forEach(packager => promises.push(packager.ready));
        await Promise.all(promises);

        promises.size = 0;
        packagers.forEach(packager => promises.push(packager.declaration.ready));
        await Promise.all(promises);

        const output = {};
        for (const bundle of bundles.values()) {
            if (bundle.error) continue;

            output[bundle.id] = {id: bundle.id};
            if (!packagers.has(bundle.id)) continue;

            const packager = packagers.get(bundle.id);
            output[bundle.id].code = packager.declaration.code;
            output[bundle.id].processed = packager.declaration.processed;
            output[bundle.id].errors = packager.declaration.errors;
            output[bundle.id].warnings = packager.declaration.warnings;
        }

        //- get external dependencies declarations
        const externalsIds = [];
        ids.forEach(id => !id.includes('application//') && externalsIds.push(id));
        for (const external of externalsIds) {
            const [project, dependency] = external.split('//')
            const app = applications.get(parseInt(project));

            const {dts, error} = await this.#typings(app?.path, dependency);
            output[external] = {
                id: external,
                code: dts,
                processed: !!dts,
                errors: [error]
            };
        }

        return output;
    }
}