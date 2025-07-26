module.exports = class {
    #model;

    constructor(model) {
        this.#model = model;
    }

    async path(id) {
        const template = new this.#model.Template(`application//${id}`);
        await template.ready;
        if (template.error) return console.error('Template not valid');

        await template.overwrites.ready;
        return template.overwrites.path;
    }

    async list(ids) {
        if (!(ids instanceof Array)) throw new Error('Invalid parameters');
        if (!ids.length) return;

        ids = ids.map(id => `application//${id}`);
        const collection = new this.#model.Collection(this.#model.Template, ids);
        await collection.ready;

        const promises = [];
        collection.forEach(template => promises.push(template.overwrites.ready));
        await Promise.all(promises);

        const output = {};
        for (const template of collection.values()) {
            const items = [];
            //TODO pendiente caso de uso cuando trae overwrites de la libreria
            template.overwrites.forEach((overwrite, index) => {
                if (!index) return;

                let processor;
                if (overwrite.config?.hasOwnProperty('scss')) processor = 'scss';
                if (overwrite.config?.hasOwnProperty('less')) processor = 'less';

                let module, bundle;
                if (index.includes('libraries')) [, , module, bundle] = index.split('/');
                else [module, bundle] = index.split('/');

                let path = overwrite.path;

                if (bundle === 'static' && overwrite) {
                    const regex = /\/.*\.*/;
                    let staticPath = Object.keys(overwrite.config)[0];
                    staticPath = staticPath.replace(regex, '');
                    path = require('path').join(path, staticPath);
                }
                else if (overwrite.config?.path) path = require('path').join(path, overwrite.config.path);

                items.push({
                    id: `${template.id}//${index}`,
                    path: path,
                    application: template.id,
                    module: module,
                    bundle: bundle,
                    processor: processor,
                    errors: overwrite.errors,
                    warnings: overwrite.warnings
                });
            });
            output[template.id] = items;
        }

        return output;
    };

    async get(ids) {
        if (!(ids instanceof Array)) throw new Error('Invalid parameters');
        if (!ids.length) return;

        const regex = /\/\/[a-zA-z]*\.[a-zA-z]*/;
        ids = ids.map(id => id.replace(regex, ''));
        const collection = new this.#model.Collection(this.#model.TemplateOverwrite, ids);
        await collection.ready;

        const output = {};
        for (const overwrite of collection.values()) {
            if (overwrite.error) continue;

            const split = overwrite.moduleId.split('/');
            output[overwrite.id] = {
                id: overwrite.id,
                module: split[0],
                bundle: split[1],
                processor: split[2]
            }
            output[overwrite.id] = {...output[overwrite.id], ...overwrite.toJSON()};
        }

        return output;
    }
}
