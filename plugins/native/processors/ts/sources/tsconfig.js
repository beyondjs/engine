const {SourcesFile} = require('beyond/plugins/sdk');
const fs = require('beyond/utils/fs');
const crc32 = require('beyond/utils/crc32');
const {join} = require('path');
const ts = require('typescript');

const defaults = {
    incremental: true,
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ESNext,
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
    sourceMap: true,
    inlineSources: false,
    declaration: true,
    // noEmitOnError: true,
    // declarationMap: true
}

module.exports = class extends SourcesFile {
    #errors = [];
    get errors() {
        return this.#errors;
    }

    get valid() {
        return !this.#errors.length;
    }

    #content;
    get content() {
        return this.#content;
    }

    #hash;
    get hash() {
        if (this.#hash !== undefined) return this.#hash;
        return this.#hash = this.#content ? crc32(this.#content) : 0;
    }

    #path;
    #file;

    constructor(processor) {
        super(processor, {file: 'tsconfig.json'});
    }

    _prepared() {
        return !!this.#file;
    }

    async _process(request) {
        const errors = [];
        this.#content = this.#hash = void 0;

        if (!this.#file) {
            this.#content = {};
            this.#hash = 0;
            return;
        }

        const exists = await fs.exists(this.#file);
        if (this.cancelled(request)) return;

        try {
            const content = exists ? await fs.readFile(this.#file, 'utf8') : void 0;
            if (this.cancelled(request)) return;
            this.#content = content ? JSON.parse(content) : {};

            this.#content.compilerOptions = (() => {
                let {compilerOptions} = this.#content;
                compilerOptions = compilerOptions ? compilerOptions : {};
                compilerOptions.jsx && (compilerOptions.jsx = ts.JsxEmit.React);
                compilerOptions.noImplicitUseStrict = true;
                compilerOptions.tsBuildInfoFile = join(this.#path, 'tsconfig.tsbuildinfo');

                // The following properties should not be set
                delete compilerOptions.paths;
                delete compilerOptions.outDir;
                delete compilerOptions.moduleResolution;

                return Object.assign(compilerOptions, defaults);
            })();
        }
        catch (exc) {
            errors.push(exc.message);
        }

        this.#errors = errors;
    }

    configure(path) {
        if (path === this.#path) return;

        this.#path = path;
        this.#file = join(path, 'tsconfig.json');
        this._invalidate();
    }
}
