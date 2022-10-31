const {Processors} = require('../processors');
const {join} = require('path');
module.exports = class Bundle extends require('../../../../file-manager') {
    _create;
    _created;
    #processors;
    #viewProcessors = ['vue', 'svelte'];

    skeleton = ['hmr', 'ts'];
    /**
     * Name of the bundle type
     * @private
     */
    _type;

    get type() {
        return this._type;
    }

    get identifier() {
        return this._identifier;
    }

    /**
     * The basename of the bundle represents the folder where it's contained
     * @returns {*}
     */
    get path() {
        return this.file.basename;
    }

    /**
     * Defines if the bundle uses an only processor
     */
    #alone;

    /**
     * Bundle constructor
     *
     * @param dirname
     * @param basename
     * @param specs parameters to set in the bundle class
     */
    constructor(dirname, basename, specs = {}) {
        super(dirname, basename);
        this.#processors = new Processors(this, specs);

        delete specs.name;
        this.setValues(specs);
    }

    setValues(specs) {
        this._checkProperties(specs, true);

        if (specs.bundle) this._type = specs.bundle;
        if (specs.alone) {
            this.#alone = true;
            this.#processors.add(specs.alone, {...specs, path: false})
            return;
        }
        this.#processors.TYPES.forEach((properties, processor) => {
            const has = specs.hasOwnProperty(processor) || specs?.processors?.includes(processor);
            if (!has) return;
            specs = Object.assign({skeleton: properties}, specs)
            this.#processors.add(processor, specs);
        });
    }

    /**
     * Build the bundle module structure
     *
     * The method must be called to create correctly the bundle, is the charge to
     * create directories and files required
     * @returns {Promise<void>}
     */
    async build() {
        const promises = [];
        //check default files
        const tplPath = await this.templatesPath();
        const {fs} = global.utils;
        const path = join(tplPath, this._type);

        if (!fs.exists(path)) {
            throw new Error(`Template for ${this._type} bundle not found.`)
        }

        const items = this.#processors.items;
        const filter = [...items.keys()].filter(i => this.#viewProcessors.includes(i));
        if (!filter.length) items.forEach(processor => promises.push(processor.build()));
        else {
            for (const f of filter) {
                const p = items.get(f);
                promises.push(p.build());
            }
        }

        if (promises.length) return Promise.all(promises);
    }

    getProperties() {
        let props = super.getProperties();

        this.#processors.items.forEach(processor => {
            if (this.#alone) props = {...props, ...(processor.getProperties())};
            else props[processor.type] = processor.getProperties();
        });
        return props;
    }

    update(specs) {
        this.validateSpecs(specs);
    }
}
