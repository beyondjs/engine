let model;
module.exports = m => (model = m) && Processor;

class Processor extends (require('./base')) {
    #processor;

    get item() {
        return this.#processor;
    }

    #name;
    get name() {
        return this.#name;
    }

    get path() {
        return this.#processor.path;
    }

    #bundle
    get bundle() {
        return this.#bundle;
    }

    get packager() {
        return this.#processor.packager;
    }

    get compiler() {
        return this.#processor.packager?.compiler;
    }

    get dependencies() {
        return this.#processor?.dependencies;
    }

    get externals() {
        return this.#processor.externals;
    }

    async files() {
        if (this.name === 'js') return;

        await this.#processor.files.ready;

        const promises = [];
        this.#processor.files.forEach(source => promises.push(source.ready));
        await Promise.all(promises);

        return this.#processor.files;
    }

    async overwrites() {
        if (this.name === 'ts' || this.name === 'js') return;

        await this.#processor.overwrites?.ready;

        const promises = [];
        this.#processor.overwrites?.forEach(source => promises.push(source.ready));
        await Promise.all(promises);

        return this.#processor.overwrites;
    }

    async _initialise() {
        if (this._id.length < 5) return this._done(`Processor id "${this.id}" is invalid`);

        const name = this._id[this._id.length - 1];

        //TODO @box @ftovar optimizar esta logica para cargar los procesadores globales
        await global.processors.ready;
        if (!global.processors.has(name)) return this._done(`Processor "${name}" is not registered`);

        const bundleId = this._id.slice(0, this._id.length - 1);
        const bundle = new model.Bundle(bundleId);
        await bundle.ready;
        if (bundle.error) return this._done(`Processor not valid, ${module.error}`);

        const {application, platforms} = bundle.item.container;
        const distribution = await model.distribution(application.id, bundle, platforms);

        if (!distribution) {
            return this._done(`Processor "${this.id}" don't have distribution`);
        }

        const packager = bundle.packagers.get(distribution);
        await packager.ready;
        await packager.processors.ready;

        if (!packager.processors.has(name))
            return this._done(`Bundle "${bundle.id}" does not have a processor "${name}"`);

        const processor = packager.processors.get(name);
        await processor.ready;
        this.#processor = processor;
        this.#name = name;
        this.#bundle = bundle;

        this._done();
    };

    toJSON() {
        return {
            id: this.id,
            name: this.item.name,
            path: this.item.path,
            updated: this.item.updated,
            destroyed: this.item.destroyed,
            multilanguage: this.item.multilanguage,
            errors: this.item.errors ?? [],
            warnings: {
                processor: this.item.warnings ?? [],
                files: this.item.files?.warnings ?? [],
                templates: this.item.templates?.warnings ?? [],
                overwrites: this.item.overwrites?.warnings ?? []
            }
        }
    }
}
