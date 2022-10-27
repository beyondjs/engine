module.exports = class {
    #is;
    get is() {
        return this.#is;
    }

    #file;
    get file() {
        return this.#file;
    }

    #map;
    get map() {
        return this.#map;
    }

    #code;
    get code() {
        return this.#code;
    }

    #declaration;
    get declaration() {
        return this.#declaration;
    }

    constructor(file, compilation) {
        this.#file = file;

        // The module is the source.file without its extension
        let module = file;
        const extensions = (require('../../extensions'));
        for (const ext of extensions) {
            if (module.endsWith(ext)) {
                module = module.substr(0, module.length - ext.length);
                break;
            }
        }

        // Get the compiled files of the current source
        for (const [file, content] of compilation) {
            if (!file.startsWith(module)) continue;
            const ext = file.substr(module.length);
            if (!['.js', '.d.ts', '.js.map'].includes(ext)) continue;

            if (ext === '.d.ts') this.#declaration = content;
            else if (ext === '.js') this.#code = content;
            else if (ext === '.js.map') this.#map = content;
        }
    }

    toJSON() {
        return Object.assign({
            file: this.#file,
            map: this.map,
            code: this.code,
            declaration: this.declaration
        });
    }
}
