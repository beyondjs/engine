const Resource = require('../../../resource');

module.exports = class {
    #source;
    #processor;

    #dependencies = new Set();
    get dependencies() {
        return this.#dependencies;
    }

    constructor(source, processor) {
        this.#source = source;
        this.#processor = processor;
    }

    findFileUrl = async (file) => {
        const {application} = this.#processor;
        const resource = new Resource(this.#processor, this.#source, file);

        // Property resource.url is set if the file is found in the collection of files of the bundle,
        // or if it is found in the collection of files of the application template
        if (resource.url) return resource.url;
        if (!resource.bundle && !resource.external) return null;

        // Try to solve the file as it is contained in an application module
        const url = await (async () => {
            const bundle = resource.bundle.dependency;
            if (!bundle) return;

            const dependency = new (require('./dependency'))(application, bundle);
            await dependency.process();
            if (dependency.error) return;

            const url = resource.solve(dependency.files, resource.bundle.file);
            url && this.#dependencies.add(resource.bundle.dependency);
            return url;
        })();
        if (url) return url;

        // Check if the file is contained in an external package
        const external = await require('./external')(resource.external, application);
        if (external) {
            this.#dependencies.add(resource.external.pkg);
            return external;
        }

        throw new Error(`File "${file}" not found`);
    }
}
