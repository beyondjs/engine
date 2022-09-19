const {ipc} = global.utils;
const DynamicProcessor = global.utils.DynamicProcessor();

module.exports = class extends DynamicProcessor {
    get dp() {
        return 'bundler.bundle.declaration';
    }

    get id() {
        return this.#packager.bundle.id;
    }

    _notify() {
        ipc.notify('data-notification', {
            type: 'record/update',
            table: 'declarations',
            id: this.id
        });
    }

    #packager;
    get packager() {
        return this.#packager;
    }

    #hash;
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

    constructor(packager) {
        super();
        this.setMaxListeners(500);
        this.#packager = packager;
        this.#cache = new (require('./cache'))(packager);
        super.setup(new Map([['hash', {child: packager.hash}]]));
    }

    async save() {
        await this.ready;
        const {bundle} = this.#packager;
        this.valid && await require('./save')(bundle, this.#code);
    }

    async _begin() {
        const cached = await this.#cache.load();
        if (cached) {
            this.#code = cached.code;
            this.#errors = cached.errors;
            this.#hash = cached.hash;
            this.#processed = true;
        }
        await this.#packager.ready;
    }

    _prepared(require) {
        const hash = this.children.get('hash').child;
        if (!require(hash)) return; // Wait to know the packager hash
        if (hash.value === this.#hash) return; // No further processing required

        // When the code was returned from cache, and the processors were not registered as a child
        const packager = this.#packager;
        if (!this.children.has('processors')) {
            const children = new Map();
            const subscriptions = ['declaration.initialised', 'declaration.change'];
            children.set('processors', {child: packager.processors, events: subscriptions})
            this.children.register(children, false);
        }

        const processors = this.children.get('processors').child;
        if (!require(processors)) return;
        processors.forEach(({packager}) => packager?.declaration && require(packager.declaration));
    }

    #process() {
        if (!this.processed) throw new Error('Processor is not ready. Wait for the .ready property before accessing its state.');
        if (this.#processed) return; // Already processed

        const hash = this.children.get('hash').child.value;
        const tsc = this.#packager.distribution?.ts?.compiler === 'tsc';

        const done = ({code, errors}) => {
            this.#code = code;
            this.#errors = errors ? errors : [];
            this.#hash = hash;
            this.#processed = true;

            tsc && this.#cache.save(this.#code, this.#errors, hash);
            tsc && this.save().catch(exc => console.log(exc.stack));
        };

        if (!tsc) return done({code: ''});

        let code = '';
        const processors = this.children.get('processors').child;
        if (!processors.size) return done({code: ''});

        // Check if any of the processors have errors
        const errors = [];
        for (const [name, {packager}] of processors) {
            if (!packager?.declaration || packager.declaration.valid) continue;
            errors.push(`Processor ${name} has been compiled with errors.`);
        }
        if (errors.length) return done({errors});

        // Process the declaration
        for (const [name, {packager}] of processors) {
            if (!packager?.declaration || !packager.declaration.code) continue;
            code += global.utils.code.header(`Processor: ${name}`) + '\n';
            code += packager.declaration.code + '\n\n';
        }

        code += require('./hmr-activation')(this.#packager.bundle);

        done({code});
    }

    _process() {
        const hash = this.children.get('hash').child.value;
        if (hash === this.#hash) return false;

        this.#errors = this.#code = this.#hash = void 0;
        this.#processed = false;
    }
}
