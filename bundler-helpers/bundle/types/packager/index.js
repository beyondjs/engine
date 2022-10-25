const DynamicProcessor = require('beyond/utils/dynamic-processor');
const ipc = require('beyond/utils/ipc');
const {header} = require('beyond/utils/code');
const {PackagerDeclarationCache} = require('beyond/cache');
const {SourceMap} = require('beyond/bundlers-helpers');

module.exports = class extends DynamicProcessor() {
    get dp() {
        return 'bundler.bundle.declaration';
    }

    #bundle;
    get bundle() {
        return this.#bundle;
    }

    #platform;
    get platform() {
        return this.#platform;
    }

    #language;
    get language() {
        return this.#language;
    }

    #id;
    get id() {
        return this.#id;
    }

    #pset;

    _notify() {
        ipc.notify('data-notification', {
            type: 'record/update',
            table: 'declarations',
            id: this.id
        });
    }

    #hash;
    get hash() {
        return this.#hash;
    }

    #cache;

    #processed = false;
    #errors;
    get errors() {
        this.#process();
        return this.#errors ? this.#errors : [];
    }

    get valid() {
        return this.processed && !this.errors.length;
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

    constructor(bundle, platform, language) {
        super();
        this.#bundle = bundle;
        this.#id = `${bundle.id}//${platform}` + (language ? `//${language}` : '');
        this.#platform = platform;
        this.#language = language;
        this.#pset = bundle.psets.create(platform, true, language);

        this.#cache = new PackagerDeclarationCache(this);
        super.setup(new Map([['hash', {child: this.#pset.hash}]]));
    }

    async save() {
        await this.ready;
        this.valid && await require('./save')(this.#bundle, this.#code);
    }

    async _begin() {
        const cached = await this.#cache.load();
        cached && this.hydrate(cached);
    }

    _prepared(require) {
        const hash = this.children.get('hash').child;
        if (!require(hash)) return; // Wait to know the packager hash
        if (hash.value === this.#hash) return; // No further processing required

        // When the code was returned from cache, and the pset were not registered as a child
        if (!this.children.has('pset')) {
            const children = new Map();
            const subscriptions = ['declaration.initialised', 'declaration.change'];
            children.set('pset', {child: this.#pset, events: subscriptions})
            this.children.register(children, false);
        }

        const pset = this.children.get('pset').child;
        if (!require(pset)) return;
        pset.forEach(({packager}) => packager?.declaration && require(packager.declaration));
    }

    #process() {
        if (!this.processed) throw new Error('Processor is not ready. Wait for the .ready property before accessing its state.');
        if (this.#processed) return; // Already processed

        const hash = this.children.get('hash').child.value;

        const done = ({sourcemap, errors}) => {
            this.#code = sourcemap?.code;
            this.#map = sourcemap?.map;
            this.#errors = errors ? errors : [];
            this.#hash = hash;
            this.#processed = true;

            this.#cache.save();
            this.save().catch(exc => console.log(exc.stack));
        };

        const sourcemap = new SourceMap();
        const pset = this.children.get('pset').child;
        if (!pset.size) return done({});

        // Check if any of the pset have errors
        const errors = [];
        for (const [name, {packager}] of pset) {
            if (!packager?.declaration || packager.declaration.valid) continue;
            errors.push(`Processor ${name} has been compiled with errors.`);
        }
        if (errors.length) return done({errors});

        // Process the declaration
        for (const [type, {packager}] of pset) {
            if (!packager?.declaration || !packager.declaration.code) continue;

            sourcemap.concat(header(`Processor: ${type}`));
            const {code, map} = packager.declaration;
            sourcemap.concat(code, map);
        }

        require('./hmr-activation')(this.#packager.bundle, sourcemap);
        done({sourcemap});
    }

    _process() {
        const hash = this.children.get('hash').child.value;
        if (hash === this.#hash) return false;

        this.#errors = this.#code = this.#hash = void 0;
        this.#processed = false;
    }

    toJSON() {
        this.#process();
        const {code, map, errors, hash} = this;
        return {code, map, errors, hash};
    }

    hydrate(cached) {
        this.#errors = cached.errors;
        this.#code = cached.code;
        this.#map = cached.map;
        this.#hash = cached.hash;
        this.#processed = true;
    }
}
