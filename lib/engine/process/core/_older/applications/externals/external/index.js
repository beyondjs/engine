const DynamicProcessor = global.utils.DynamicProcessor();
const fs = require('fs');
const {equal} = global.utils;

module.exports = class extends DynamicProcessor {
    get dp() {
        return 'application.external';
    }

    #application;
    #pkg;

    get package() {
        return this.#pkg.id;
    }

    get id() {
        return `${this.#application.id}//${this.#pkg.id}`;
    }

    #errors = [];
    get errors() {
        return [].concat(this.#errors, this.#pkg.errors);
    }

    get warnings() {
        return this.#pkg.warnings;
    }

    get valid() {
        return !this.errors.length;
    }

    // The development and production files paths
    #js = new Map();

    filename(distribution) {
        const environment = distribution.local || distribution.environment === 'development' ?
            'development' : 'production';

        // Check if already processed
        if (this.#js.has(environment)) return this.#js.get(environment);

        if (!this.#pkg.valid) return {errors: this.#pkg.errors};

        // Check if found
        if (!this.#pkg.js.has(environment)) return {};

        const {filename} = this.#pkg.js.get(environment);
        return {filename};
    }

    js(filename) {
        if (this.#js.has(filename)) return this.#js.get(filename);

        const map = filename.endsWith('.js.map');

        // Find the filename from development / production environment
        const get = environment => {
            const {js} = this.#pkg;
            const info = js.get(environment);

            const resource = map ? filename.substr(0, filename.length - 4) : filename;
            return info.filename === resource ? info : void 0;
        }

        const info = get('production') || get('development');
        if (!info) return {};
        if (map && !info.map) return {};

        // Read the content of the file
        let {source, format} = info;
        source = map ? `${source}.map` : source;

        let content = fs.readFileSync(source, 'utf8');
        let errors;
        ({content, errors} = format !== 'esm' || map ? {content} : require('./amd')(content));

        // Save in memory cache
        this.#js.set(filename, {content, errors});

        return {content, errors};
    }

    // The typings of the package
    #dts;
    get dts() {
        if (this.#dts) return this.#dts;
        if (!this.#pkg.dts) return;

        // Read the content of the file
        const content = fs.readFileSync(this.#pkg.dts, 'utf8');
        this.#dts = content;
        return content;
    }

    constructor(application, pkg) {
        super();
        this.setMaxListeners(500); // How many bundles can require the same external dependency

        this.#application = application;
        this.#pkg = new (require('./package'))(pkg, application);
    }

    _process() {
        this.#js.clear();
        this.#dts = undefined;

        const config = this.#configuration;
        if (config && typeof config !== 'object') {
            this.#pkg.configure();
            this.#errors = ['Configuration is invalid or not set'];
            return;
        }

        this.#pkg.configure(config);
    }

    _invalidate = () => super._invalidate();
    #configuration;

    configure(config) {
        if (equal(config, this.#configuration)) return;

        this.#configuration = config;
        this._invalidate();
    }
}
