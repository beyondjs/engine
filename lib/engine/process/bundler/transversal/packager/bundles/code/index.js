const header = require('./header');
const DynamicProcessor = global.utils.DynamicProcessor();

module.exports = class extends DynamicProcessor {
    get dp() {
        return 'transversal.packager.packagers.code';
    }

    // The transversal packager
    #tp;
    #packagers;

    // The last processed hash
    #hash;
    #cache;

    #errors;
    get errors() {
        this.#process();
        return this.#errors ? this.#errors : [];
    }

    get valid() {
        return !this.errors.length;
    }

    #code;
    get code() {
        this.#process();
        return this.#code;
    }

    #map;
    get map() {
        this.#process();
        return this.#map;
    }

    #count;
    get count() {
        this.#process();
        return this.#count;
    }

    constructor(tp, packagers) {
        super();
        this.#tp = tp;
        this.#packagers = packagers;
        this.#cache = new (require('./cache'))(tp);

        super.setup(new Map([['hash', {child: packagers.hash}]]));
    }

    async _begin() {
        const cached = await this.#cache.load();
        if (cached) {
            this.#code = cached.code;
            this.#map = cached.map;
            this.#count = cached.count;
            this.#errors = cached.errors;
            this.#hash = cached.hash;
        }
    }

    get #updated() {
        return this.children.get('hash').child.value === this.#hash;
    }

    _prepared(require) {
        if (this.#updated) return;

        // When the code was returned from cache and the packagers were not registered as a child
        const packagers = this.#packagers;
        if (!this.children.has('packagers')) {
            this.children.register(new Map([['packagers', {child: packagers}]]));
            if (!require(packagers)) return;
        }

        packagers.forEach(packager => require(packager.js));
    }

    _process() {
        if (this.#updated) return false;
        this.#code = this.#map = this.#count = this.#errors = this.#hash = void 0;
    }

    #process() {
        if (this.#code !== void 0) return;

        const packagers = this.children.get('packagers').child;
        const hash = this.children.get('hash').child;

        const done = ({code, map, count, errors}) => {
            code = count ? code : '';
            errors = errors ? errors : [];
            this.#cache.save(code, map, count, errors, hash.value);

            this.#code = code;
            this.#map = map;
            this.#count = count;
            this.#errors = errors;
            this.#hash = hash.value;
        }

        if (!packagers.valid) return done({errors: packagers.errors});

        // Check for errors on bundles of libraries and modules
        if (!packagers.size) return done({code: '', count: 0});

        // Create the bundle object
        const sourcemap = new (require('./sourcemap'))();

        let count = 0, errors = [];
        packagers.forEach(packager => {
            const {bundle, js} = packager;
            if (!js.valid) {
                errors.push(`Code packager of bundle "${bundle.specifier}" has reported errors`);
                return;
            }
            if (!js.code) return;

            sourcemap.concat(header(bundle));

            const creator = 'function(ims, exports) {';

            const specs = {
                module: {
                    vspecifier: bundle.container.vspecifier,
                    multibundle: bundle.container.bundles.size > 1
                },
                type: bundle.type,
                name: bundle.name
            };
            !specs.module.multibundle && delete (specs.module.multibundle);
            specs.type === specs.name && delete specs.name;

            sourcemap.concat(`bundles.push([${JSON.stringify(specs)}, ${creator}`);
            sourcemap.concat(js.code(), js.map());
            sourcemap.concat('}]);\n\n');

            count++;
        });

        done({count, errors, code: sourcemap.code, map: sourcemap.map})
    }
}
