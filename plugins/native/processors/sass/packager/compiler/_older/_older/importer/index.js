const {pathToFileURL} = require('url');

module.exports = class {
    #packager;

    #dependencies = new Set();
    get dependencies() {
        return this.#dependencies;
    }

    constructor(packager) {
        this.#packager = packager;
    }

    // findFileUrl = async (url) => {
    //     const {files, application} = this.#packager.processor;
    //
    //     if (!url.startsWith('~')) {
    //         url = `${url}.scss`;
    //         return files.has(url) ? pathToFileURL(files.get(url).file) : null;
    //     }
    //
    //     const parsed = require('./parse')(url);
    //
    //     // Check if the file is contained in an external package
    //     const external = require('./external')(parsed, application);
    //     if (external) return external;
    //
    //     this.#dependencies.add(parsed.bundle.resource);
    //
    //     // Check if the file is contained in an application module
    //     const dependency = new (require('../dependencies/dependency'))(application, parsed.bundle.resource);
    //     await dependency.process();
    //
    //     if (!dependency.files.has(parsed.file)) {
    //         throw new Error(`File not found on bundle "${dependency.bundle}"`);
    //     }
    //     return pathToFileURL(dependency.files.get(parsed.file).file);
    // }

    canonicalize = url => {
        console.log('canonicalize', url);

        const {files, application} = this.#packager.processor;

        if (!url.startsWith('~')) {
            url = `${url}.scss`;
            return files.has(url) ? pathToFileURL(files.get(url).file) : null;
        }
    }

    load = url => {
        console.log('load url', url);
    }
}
