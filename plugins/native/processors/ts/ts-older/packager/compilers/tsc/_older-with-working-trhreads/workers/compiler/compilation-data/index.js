module.exports = class {
    #diagnostics = new (require('./diagnostics'))();
    get diagnostics() {
        return this.#diagnostics;
    }

    #files = new (require('./files'))();
    get files() {
        return this.#files;
    }

    #externals;
    get externals() {
        return this.#externals;
    }

    #tsBuildInfo;

    constructor(files, {emitted, externals, diagnostics}) {
        this.#diagnostics.process(diagnostics);
        this.#files.process(files, emitted);
        this.#externals = externals;
        this.#tsBuildInfo = emitted.get('tsconfig.tsbuildinfo');
    }

    toJSON() {
        return {
            files: this.#files,
            diagnostics: this.#diagnostics,
            tsBuildInfo: this.#tsBuildInfo,
            externals: [...this.#externals]
        };
    }
}
