const Resource = require('../../resource');
const {pathToFileURL} = require('url');

module.exports = class {
    #source;
    #compiler;

    constructor(source, compiler) {
        this.#source = source;
        this.#compiler = compiler;
    }

    findFileUrl = (file) => {
        const resource = new Resource(this.#compiler.packager.processor, this.#source, file);
        if (resource.url) return resource.url;

        const {depfiles} = this.#compiler;

        // Solve the dependency as a bundle of a module in the application
        const bundle = (() => {
            if (!depfiles.has(resource.bundle.dependency)) return;

            const files = depfiles.get(resource.bundle.dependency);
            const url = resource.solve(files, resource.bundle.file);
            return url ? url : null;
        })();
        if (bundle !== void 0) return bundle;

        // Solve the dependency as an external dependency
        return (() => {
            const {dependencies} = depfiles;
            if (!dependencies.has(resource.external.pkg)) return;
            const dependency = dependencies.get(resource.external.pkg);

            const {external} = dependency;
            if (!external) return;

            let file = !resource.external.file ? external.json.sass : resource.external.file;
            file = require('path').join(external.path, file);
            return pathToFileURL(file);
        })();
    }
}
