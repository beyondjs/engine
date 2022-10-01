const ts = require('typescript');

module.exports = class extends global.ProcessorOptions {
    #errors = [];
    get errors() {
        return this.#errors;
    }

    #defaults;
    #value;
    get value() {
        return this.#value;
    }

    constructor(processor, meta) {
        super(processor, meta);

        this.#defaults = {
            incremental: true,
            module: ts.ModuleKind.ESNext,
            target: ts.ScriptTarget.ESNext,
            moduleResolution: ts.ModuleResolutionKind.NodeJs,
            sourceMap: true,
            inlineSources: false,
            declaration: true,
            // noEmitOnError: true,
            // declarationMap: true
        };
    }

    async _process(request) {
        await super._process(request);
        if (request !== this._request) return;

        if (!this.valid) return;

        this.#value = undefined;

        let value;
        try {
            value = this.content ? JSON.parse(this.content) : {};
            value = value.compilerOptions;
            value = value ? value : {};
            value.jsx && (value.jsx = ts.JsxEmit.React);
            delete value.paths;
            delete value.outDir;
            delete value.moduleResolution;
            value.noImplicitUseStrict = true;
            value.tsBuildInfoFile = require('path').join(this.processor.path, 'tsconfig.tsbuildinfo');
        }
        catch (exc) {
            this.errors.push(`Error parsing tsconfig.json - ${exc.message}`);
            return;
        }

        this.#value = Object.assign(value, this.#defaults);
    }
}
