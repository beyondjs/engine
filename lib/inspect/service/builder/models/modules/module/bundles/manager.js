const TYPES = require('./types');
module.exports = class extends require('../../../file-manager') {
    #types = Object.keys(TYPES);
    get types() {
        return this.#types;
    }

    get TYPES() {
        return TYPES;
    }

    #items = new Map()
    get items() {
        return this.#items;
    }

    #content;

    get properties() {
        const props = {};
        this.items.forEach(bundle => {
            const {identifier} = bundle;
            const name = identifier === 'page' || identifier === 'layout' ? 'widget' : identifier;
            props[name] = bundle.getProperties();
        });
        return props;
    }

    constructor(dirname, basename, content) {
        super(dirname, basename);
        this.#content = content;
        content && this.load();
    }

    /**
     * Return de object that represents the  bundle type to be created
     *
     * Each Bundle type has a unique object to manage its properties
     * by itself.
     *
     * @param name
     * @param specs
     * @returns {*}
     * @private
     */
    get(name, specs) {
        if (this.items.has(name)) return this.items.get(name);
        if (!this.TYPES.hasOwnProperty(name)) {
            throw new Error(`The specified bundle ${name} does not exists`);
        }

        specs = {...specs, bundle: name};
        if (typeof specs[name] === 'object') {
            const specified = specs[name];
            specs = {...specs, ...specified}
            delete specs[name];
        }

        delete specs.bundles;

        if (!specs.processors) specs.processors = [];
        specs.processors.push('ts');
        specs.processors = Array.from(new Set(specs.processors));
        const Bundle = this.TYPES[name];
        const item = new Bundle(this.file.file, specs);
        this.#items.set(name, item);
        return item;
    }

    /**
     *
     * @param content
     * @returns {Promise<void>}
     */
    async load(content) {
        if (content) this.#content = content;
        for (const bundle of Object.keys(this.TYPES)) {
            if (!this.#content.hasOwnProperty(bundle)) continue;
            const specs = {...{bundle: bundle}, ...this.#content[bundle]};
            const item = this.get(bundle, specs);
            this.items.set(item.identifier, item)
        }

    }

    addItem(bundle, specs = {}) {

        const item = this.get(bundle, specs);
        item.setValues(specs);
        this.items.set(bundle, item);
        return item;
    }

    add(specs) {
        let {bundles, multilanguage} = specs;

        if (!bundles) return;
        if (typeof bundles === 'string') bundles = [bundles];

        if (multilanguage) this.items.set('txt', this.get('txt', {...{create: true}}));
        for (let bundle of bundles) {
            /**
             * TODO: @julio change logic.
             * Originally the bundle properties were passed at the same level of the module specs.
             * This version is deprecated, now it's necessary to pass the bundle name
             * as a property and the bundles values in a object defined as a value of the bundle name property
             */
            const bundleSpecs = specs.hasOwnProperty(bundle) ? {...specs[bundle]} : {...specs};

            if (this.items.has(bundle)) {
                const data = {...this.items.get(bundle), ...bundleSpecs};

                this.items.set(bundle, data);
            }

            this.addItem(bundle, bundleSpecs);
        }
    }

    async build(specs, overwrite = true) {
        const promises = [];
        this.items.forEach(item => {
            //TODO: @julio check this line
            if (specs?.bundles.includes('page') && specs.layoutId) item.layout = specs.layoutId;
            promises.push(item.build());
        });
        return Promise.all(promises);
    }

    check(specs = {}) {
        const properties = Object.keys(specs);
        properties.forEach(property => {
            this.#types.includes(property) && this.addItem(property, specs[property])
        });

    }
}
