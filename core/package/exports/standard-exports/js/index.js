const ESBuildPlugin = (require('./es-build-plugin'));
const {sep} = require('path');
const {TargetedExportResourceStandard, SourceMap} = require('beyond/plugins/sdk');
const resolveRequireCalls = require('./require-calls');

module.exports = class extends TargetedExportResourceStandard {
    get resource() {
        return 'js';
    }

    #packages;
    #plugin;

    get hash() {
        return 0;
    }

    constructor(targetedExport) {
        super(targetedExport, {preprocessor: true});

        // Do not import at the beginning of the file to avoid cyclical import
        this.#packages = require('beyond/packages');
    }

    _prepared(require) {
        require(this.targetedExport.pkg.dependencies);
        if (!require(this.#packages)) return;
        this.#packages.forEach(pkg => require(pkg.exports));
        return super._prepared(require);
    }

    async _preprocess(request) {
        this.#plugin?.cancel();

        if (!this.targetedExport.pkg.dependencies.filled) {
            return {errors: ['Package dependencies are not updated']};
        }

        this.#plugin = new ESBuildPlugin(this.targetedExport);

        let build;
        let errors = [];

        try {
            const incremental = this.targetedExport.packageExport.pkg.is === 'internal';

            build = await require('esbuild').build({
                entryPoints: ['bundle.js'],
                incremental,
                sourcemap: 'external',
                logLevel: 'silent',
                platform: 'browser',
                format: 'esm',
                bundle: true,
                write: false,
                outfile: 'out.js',
                plugins: [this.#plugin]
            });
            if (this.cancelled(request)) return;
        }
        catch (exc) {
            if (this.cancelled(request)) return;
            console.log(exc.stack);
            errors.push(`Exception caught: ${exc.message}`);
            return;
        }

        if (errors.length) {
            return {errors};
        }

        const result = build;
        errors = build.errors ? errors.concat(build.errors) : errors;
        const {warnings, outputFiles: outputs} = result;
        if (errors?.length) return {errors, warnings};

        const {code, map} = (() => {
            const output = {};
            output.code = outputs?.find(({path}) => path.endsWith(`${sep}out.js`))?.text;
            output.map = outputs?.find(({path}) => path.endsWith(`${sep}out.js.map`))?.text;

            const requires = resolveRequireCalls(this.#plugin);
            if (!requires) return output;

            const sourcemap = new SourceMap();
            sourcemap.concat(requires.imports);
            sourcemap.concat(requires.resolver);
            sourcemap.concat(output.code, void 0, output.map);
            return sourcemap;
        })();

        return {code, map, warnings};
    }

    _build() {
        const {code, map} = this.data;
        return {code, map};
    }
}
