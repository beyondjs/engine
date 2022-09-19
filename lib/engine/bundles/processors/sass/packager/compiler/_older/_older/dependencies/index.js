module.exports = class {
    #compiler;

    #hash = new (require('./hash'))();
    get hash() {
        return this.#hash;
    }

    constructor(compiler) {
        this.#compiler = compiler;
    }

    #request;
    get request() {
        return this.#request;
    }

    set request(value) {
        this.#request = value;
    }

    async update(meta, request) {
        console.log('dependencies update. meta.files:', meta.files);
        if (!meta) return;

        const dependencies = new Set();
        meta.files.forEach(data => data.dependencies.forEach(dependency => dependencies.add(dependency)));

        const {application} = this.#compiler.packager.processor;

        const children = new Map();
        for (const bundle of dependencies) {
            const dependency = new (require('./dependency'))(application, bundle);
            await dependency.process();
            if (request && this.#request !== request) return;

            children.set(bundle, dependency.files.hash);
        }

        this.#hash.update(children);
    }
}
