const DynamicProcessor = global.utils.DynamicProcessor(Map);
const Entry = require('./entry');

/**
 * The overwrites of the bundles and statics files of the modules and libraries
 */
module.exports = class extends DynamicProcessor {
    get dp() {
        return 'application.template.overwrites';
    }

    get path() {
        const config = this.children.get('config').child;
        return config.path;
    }

    #errors = [];
    get errors() {
        return this.#errors;
    }

    #warnings = [];
    get warnings() {
        return this.#warnings;
    }

    // The overwrites that have been required, used to identify those that were configured and
    // are not being used.
    // In case those overwrites are later removed from the configuration, they can then be destroyed.
    #used = new Set();

    constructor(config) {
        super();
        super.setup(new Map([
            ['config', {child: config}],
            ['bundles', {child: global.bundles}]
        ]));
    }

    /**
     * Returns an entry object that manages the overwriting of bundles or
     * static files in a container.
     *
     * @param key {string}
     * module_id/bundle (bundle_id) (ex: welcome/page, libraries/auth/login/page) => {processor: {config}}
     * module_id/start (ex: welcome/start, libraries/auth/login/start) => {processor: {config}}
     * module_id/static (ex: welcome/static, libraries/auth/login/static) => {original: replaced}
     * libraries/library_name/start (ex: libraries/auth/start) => {processor: {config}}
     * libraries/library_name/static (ex: libraries/auth/static) => {original: replaced}
     */
    get(key) {
        const entry = super.has(key) ? super.get(key) : new Entry(key);
        this.set(key, entry);
        this.#used.add(key);

        this.processed && !entry.initialised && entry.configure();
        return entry;
    }

    _process() {
        const config = this.children.get('config').child;
        this.#errors = [];
        this.#warnings = [];

        if (!config.valid) {
            this.#errors = config.errors;
            this.forEach(entry => entry.configure());
            return;
        }

        const value = config.value ? config.value : {};

        // container can be:
        //      a module (module_id => ex: welcome or libraries/auth/login)
        //      a library (libraries/library_name)
        // key can be:
        //      a registered bundle name
        //      the string 'static'
        //      the string 'start'

        const updated = new Map();
        for (const [containerId, containerConfig] of Object.entries(value)) {
            if (typeof containerConfig !== 'object') {
                this.#warnings.push(`Configuration of container "${containerId}" is not an object`);
                continue;
            }

            for (let [key, keyConfig] of Object.entries(containerConfig)) {
                if (key !== 'static' && !global.bundles.has(key)) {
                    this.#warnings.push(
                        `Key "${key}" specified in the container "${containerId}" is invalid or not found`);
                    continue;
                }

                if (typeof keyConfig !== 'object') {
                    this.#warnings.push(`Invalid "${key}" configuration on container ` +
                        `"${containerId}", an object was expected`);
                    continue;
                }

                if (key !== 'static') {
                    const {bundle} = global.bundles.get(key);
                    if (!bundle.template) {
                        this.#warnings.push(`Bundle "${key}" specified in the container ` +
                            `"${containerId}" does not support overwrites`);
                        continue;
                    }
                }

                key = `${containerId}/${key}`;
                const entry = this.has(key) ? this.get(key) : new Entry(key);
                updated.set(key, entry);
                entry.configure(config.path, keyConfig);
            }
        }

        // Copy to the updated map the entries that are being used, but are not actually configured
        this.#used.forEach(key => {
            const entry = super.get(key);
            if (updated.has(key)) return;

            entry.configure();
            updated.set(key, entry)
        });

        // Destroy unused entries
        this.forEach((entry, key) => !updated.has(key) && entry.destroy());

        this.clear();
        updated.forEach((value, key) => this.set(key, value));
    };
}
