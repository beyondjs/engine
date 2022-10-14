module.exports = class {
    #model;

    constructor(model) {
        this.#model = model;
    }

    async list(ids) {
        if (!(ids instanceof Array)) throw new Error('Invalid parameters');
        if (!ids.length) return;

        const collection = new this.#model.Collection(this.#model.Processor, ids);
        await collection.ready;

        const promises = [];
        collection.forEach(processor => !processor.error &&
            processor.dependencies && promises.push(processor.dependencies.ready)
        );
        await Promise.all(promises);

        promises.length = 0;
        collection.forEach(processor => !processor.error && processor.dependencies &&
            processor.dependencies.forEach(dependency => promises.push(dependency.ready))
        );
        await Promise.all(promises);

        const output = {};
        collection.forEach(processor => {
            const items = [];
            processor.dependencies && processor.dependencies.forEach(dependency => {
                const sources = [];
                dependency.sources.forEach(source => sources.push(source.id));

                let declaration = dependency.bundle?.id;
                if (!!dependency.external) {
                    const [, appId] = processor.id.split('//');
                    declaration = `${appId}//${dependency.specifier}`;
                }

                items.push({
                    id: dependency.id,
                    tu: Date.now(),
                    is: sources,
                    version: dependency.version,
                    kind: dependency.kind,
                    valid: dependency.valid,
                    specifier: dependency.specifier,
                    bundle_id: dependency.bundle?.id,
                    module_id: dependency.bundle?.container?.id,
                    declaration: declaration,
                    errors: dependency.errors,
                    warnings: dependency.warnings
                });
            });

            output[processor.id] = items;
        });

        return output;
    }

    //TODO Validar
    async get(ids) {
        if (!(ids instanceof Array)) throw new Error('Invalid parameters');
        if (!ids.length) return;

        const dependenciesIds = [];
        ids.forEach(id => {
            if (!id.includes('//dependency//')) return;
            const split = id.split('//dependency//');
            split[1] = `dependency//${split[1]}`;
            dependenciesIds.push(split);
        });

        const collection = new this.#model.Collection(this.#model.Dependency, dependenciesIds);
        await collection.ready;

        const output = {};
        collection.forEach(dependency => {
            if (dependency.error) return;
            output[dependency.id] = dependency.toJSON();
        });

        return output;
    }
}
