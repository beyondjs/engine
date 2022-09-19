const {pathToFileURL} = require('url');
const fs = require('fs');

module.exports = class {
    #compiler;
    #resources = new Map();

    constructor(compiler) {
        this.#compiler = compiler;
    }

    findFileUrl(resource) {

    }

    canonicalize = resource => {
        if (!resource.startsWith('~')) {
            const filename = `${resource}.scss`;
            const {files} = this.#compiler.packager.processor;
            if (!files.has(filename)) return null;

            const file = files.get(filename);
            const url = pathToFileURL(file.file);
            this.#resources.set(url.pathname, {file});
            return url;
        }

        const parsed = new (require('../parser'))(resource.slice(1));

        const {depfiles} = this.#compiler;
        const {dependencies} = depfiles;

        // Solve the dependency as a bundle of a module in the application
        const bundle = (() => {
            if (!depfiles.has(parsed.bundle.dependency)) return;

            const files = depfiles.get(parsed.bundle.dependency);
            if (!files.has(parsed.bundle.file)) return null;

            const file = files.get(parsed.bundle.file);
            const url = pathToFileURL(file.file);
            this.#resources.set(url.pathname, {file, is: 'bundle'});
            return url;
        })();
        if (bundle !== void 0) return bundle;

        // Solve the dependency as an external dependency
        return (() => {
            if (!dependencies.has(parsed.external.pkg)) return;
            const dependency = dependencies.get(parsed.external.pkg);

            const {external} = dependency;
            if (!external) return;

            const file = require('path').join(external.path, !parsed.file ? external.json.sass : parsed.file);
            const url = pathToFileURL(file);
            this.#resources.set(url.pathname, {file, is: 'external'});
            return url;
        })();
    }

    load = url => {
        console.log('load', url);
        const {pathname} = url;
        if (!this.#resources.has(pathname)) {
            throw new Error(`Url pathname "${pathname}" not previously processed`);
        }

        const {file} = this.#resources.get(pathname);
        try {
            fs.accessSync(file, fs.constants.R_OK);
        }
        catch (exc) {
            return null;
        }

        const contents = fs.readFileSync(file, 'utf8');
        const syntax = 'scss';
        return {contents, syntax};
    }
}
