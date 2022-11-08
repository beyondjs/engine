const {PackageExportCode} = require('beyond/extensible-objects');
const Plugin = (require('./plugin'));

module.exports = class extends PackageExportCode {
    get resource() {
        return 'js';
    }

    get hash() {
        return 0;
    }

    constructor(conditional) {
        super(conditional, {preprocessor: true});
    }

    async _preprocess(request) {
        this.#plugin?.cancel();
        this.#plugin = new Plugin(this.conditional, platform);

        let build;
        let errors = [];

        try {
            const incremental = this.bundle.module.pkg.is === 'internal';

            build = await require('esbuild').build({
                entryPoints: ['app.js'],
                incremental,
                logLevel: 'silent',
                platform: 'browser',
                format: 'esm',
                bundle: true,
                write: false,
                treeShaking: false,
                outfile: 'out.js',
                plugins: [this.#plugin]
            });
            if (this.cancelled(request)) return;
        }
        catch (exc) {
            if (this.cancelled(request)) return;
            errors.push(`Exception caught: ${exc.message}`);
            return;
        }

        if (errors.length) return {errors};

        const result = build;
        errors = build.errors ? errors.concat(build.errors) : errors;

        const {warnings, outputFiles: output} = result;
        const code = output?.[0]?.text;
        return {errors, warnings, code};
    }

    _build() {
        return {code: `console.log('hello world');`};
    }
}