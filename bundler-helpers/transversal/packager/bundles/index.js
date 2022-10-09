const DynamicProcessor = require('beyond/utils/dynamic-processor');

module.exports = class extends DynamicProcessor(Map) {
    get dp() {
        return 'bundler.transversal.packagers';
    }

    // The transversal packager
    #tp;

    #errors = [];
    get errors() {
        return this.#errors;
    }

    get valid() {
        return !this.errors.length;
    }

    #code;
    get code() {
        return this.#code;
    }

    #hash;
    get hash() {
        return this.#hash;
    }

    async _begin() {
        await this.#tp.ready;
    }

    /**
     * Containers constructor
     *
     * @param tp {object} The transversal packager
     */
    constructor(tp) {
        super();
        this.#tp = tp;
        const {libraries, modules} = tp.transversal.pkg;
        super.setup(new Map([['libraries', {child: libraries}], ['modules', {child: modules}]]));

        this.#hash = new (require('./hash'))(this);
        this.#code = new (require('./code'))(this.#tp, this);
    }

    _prepared(require) {
        const {transversal, cspecs, language} = this.#tp;

        const modules = this.children.get('modules').child;
        modules.forEach(container => {
            const {bundles, id} = container;
            if (!require(container, id) || !require(bundles, id)) return;

            if (!bundles.has(transversal.name)) return;
            const packager = bundles.get(transversal.name).packagers.get(cspecs, language);
            require(packager);
        });
    }

    _process() {
        const {transversal, cspecs, language} = this.#tp;
        const {platform} = cspecs;

        const errors = this.#errors = [];
        const updated = new Map();

        const modules = this.children.get('modules').child;

        modules.forEach(module => {
            if (!module.bundles.has(transversal.name)) return;
            const bundle = module.bundles.get(transversal.name);
            if (!bundle.platforms.has(platform)) return;

            if (!bundle.valid) {
                errors.push(`Bundle "${bundle.pathname}" has reported errors`);
                return;
            }

            const packager = bundle.packagers.get(cspecs, language);
            updated.set(bundle.path, packager);
        });

        // Set the updated data into the collection
        super.clear();
        updated.forEach((value, key) => this.set(key, value));
    }
}
