const {pathToFileURL} = require('url');
const {join} = require('path');

module.exports = class {
    #processor;
    #container;
    #file;
    get file() {
        return this.#file;
    }

    #url;
    get url() {
        return this.#url;
    }

    #parsed;

    get bundle() {
        return this.#parsed?.bundle;
    }

    get external() {
        return this.#parsed?.external;
    }

    constructor(processor, container, file) {
        this.#processor = processor;
        this.#container = container;
        this.#file = file;
        const {files, sources: {template}} = processor;

        if (!file.startsWith('~')) {
            let root = container.relative.dirname ? `${container.relative.dirname}/` : '';
            const normalized = join(root, this.#file).replace(/\\/g, '/');
            const file = this.solve(files, normalized);

            this.#url = file ? file : null;
            return;
        }

        if (template && file.startsWith('~template/')) {
            const {files} = template.instance;
            const file = this.#file.slice('~template/sass/'.length);
            const solved = this.solve(files, file);
            this.#url = solved ? solved : null;
            return;
        }

        // Parse the dependency as an application module or an external package
        this.#parsed = new (require('./parser'))(file.substr(1));
    }

    /**
     * Solve the resource from a list of files
     */
    solve(files, file) {
        file = (() => {
            const original = file;
            const split = original.split('/');

            file = `${original}.scss`;

            if (files.has(file)) return files.get(file).file;

            // Check if it is a partial
            const partial = (() => {
                let file = split.pop();
                if (file.startsWith('_')) return;
                return split.length ? `${split.join('/')}/_${file}.scss` : `_${file}.scss`;
            })();

            if (partial && files.has(partial)) return files.get(partial).file;

            // Check /index
            const index = `${original}/index.scss`;
            if (files.has(index)) return files.get(index).file;
        })();

        return file ? pathToFileURL(file) : void 0;
    }
}
