const DynamicProcessor = require('beyond/utils/dynamic-processor');
const Plugin = (require('./plugin'));

module.exports = class extends DynamicProcessor() {
    #bundle;
    #cspecs;

    #code;
    get code() {
        return this.#code;
    }

    #map;
    get map() {
        return this.#map;
    }

    #errors = [];
    get errors() {
        return this.#errors;
    }

    get valid() {
        return !!this.#errors?.length;
    }

    #warnings = [];
    get warnings() {
        return this.#warnings;
    }

    #processing;
    get processing() {
        return this.#processing;
    }

    #processed;
    get processed() {
        return this.#processed;
    }

    #time;
    /**
     * Timestamp when the last satisfying process was made
     * @return {number}
     */
    get time() {
        return this.#time;
    }

    constructor(bundle, cspecs) {
        super();
        this.#bundle = bundle;
        this.#cspecs = cspecs;

        super.setup(new Map([['bundle', {child: bundle}]]));
    }

    #plugin;

    async _process(request) {
        this.#plugin?.cancel();
        this.#plugin = new Plugin(this.#bundle);
        this.#processing = true;

        let build;
        try {
            const incremental = this.#bundle.pkg.external.external;

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
            if (this._request !== request) return;

            this.#processed = true;
        }
        catch (exc) {
            if (this._request !== request) return;

            this.#errors = [`Exception caught: ${exc.message}`];
            return;
        }
        finally {
            this.#processing = false;
        }

        this.#processing = false;

        const {errors, warnings, outputFiles: output} = build;
        this.#errors = errors;
        this.#warnings = warnings;
        this.#code = output?.[0]?.text;
    }

    destroy() {
        this.#plugin.cancel();
        super.destroy();
    }
}
