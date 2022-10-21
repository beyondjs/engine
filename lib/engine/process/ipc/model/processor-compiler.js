let model;
module.exports = m => (model = m) && ProcessorCompiler;

class ProcessorCompiler extends (require('./base')) {
    #compiler;

    get item() {
        return this.#compiler;
    }

    #processor;
    get processor() {
        return this.#processor;
    }

    #name
    get name() {
        return this.#name;
    }

    get diagnostics() {
        const {general, files, dependencies, extensions, bridges, overwrites} = this.#compiler.diagnostics.toJSON();
        return {
            general: this.formatErrors(general, 'diagnostics-general'),
            files: this.formatErrors(files),
            overwrites: this.formatErrors(overwrites),
            extensions: this.formatErrors(extensions),
            bridges: this.formatErrors(bridges),
            dependencies: this.formatErrors(dependencies)
        }
    }

    get packager() {
        return this.#processor?.packager;
    }

    async _initialise() {
        const [processorId, distributionId] = this.id.split('///');
        if (processorId < 5) return this._done(`Packager processor id "${this.id}" is invalid`);
        if (distributionId < 2) return this._done(`Packager distribution id "${this.id}" is invalid`);


        const id = processorId.split('//');
        const processorName = id.pop();

        const packager = new model.Packager(`${id.join('//')}///${distributionId}`);
        await packager.ready;
        if (packager.error) return this._done(`Packager bundle not valid, ${packager.error}`);

        await packager.processors.ready;
        if (!packager.processors.has(processorName))
            return this._done(`Bundle "${bundleId}" does not have a processor "${processorName}"`);

        const processor = packager.processors.get(processorName);
        await processor.ready;
        // TODO check error
        await processor.packager.compiler.ready;

        this.#processor = processor;
        this.#compiler = processor.packager.compiler;
        this.#name = processorName;

        this._done();
    };
}
