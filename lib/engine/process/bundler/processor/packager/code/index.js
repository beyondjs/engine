const DynamicProcessor = global.utils.DynamicProcessor();
const {ipc, equal} = global.utils;

module.exports = class extends DynamicProcessor {
    get dp() {
        return 'bundler.processor.packager.code';
    }

    #packager;
    get packager() {
        return this.#packager;
    }

    get id() {
        return this.#packager.id;
    }

    #extname;
    get extname() {
        return this.#extname;
    }

    #code;
    get code() {
        return this.#code;
    }

    #ims;
    get ims() {
        return this.#ims;
    }

    get compiler() {
        return this.children.get('compiler')?.child;
    }

    get analyzer() {
        return this.children.get('analyzer')?.child;
    }

    get files() {
        return this.children.get('files')?.child;
    }

    get overwrites() {
        return this.children.get('overwrites')?.child;
    }

    #hashes;
    get hashes() {
        return this.#hashes;
    }

    get synchronized() {
        return this.#hashes.synchronized;
    }

    get updated() {
        return this.#hashes.updated;
    }

    _notify() {
        const {name, specs, distribution, language} = this.#packager.processor;
        const message = {
            type: 'change',
            bundle: specs.bundle.specifier,
            extname: this.#extname,
            processor: name,
            distribution: distribution.key,
            language
        };
        ipc.notify('processors', message);
    }

    #configured = false;
    get configured() {
        return this.#configured;
    }

    #config;
    get config() {
        return this.#config;
    }

    get multilanguage() {
        return this.#config?.multilanguage;
    }

    #diagnostics;
    get diagnostics() {
        return this.#diagnostics;
    }

    get valid() {
        return this.diagnostics.valid;
    }

    constructor(packager, extname) {
        super();
        this.#packager = packager;
        this.#extname = extname;

        this.notifyOnFirst = true;

        const children = [];

        // The children can be the compiler if it exists, otherwise it could be the analyzer if it exists,
        // or the processor sources (files and overwrites)
        const {processor: {analyzer, files, overwrites}, compiler} = packager;
        if (compiler) {
            children.push(['compiler', {'child': compiler}]);
        }
        else if (analyzer) {
            children.push(['analyzer', {'child': analyzer}]);
        }
        else {
            children.push(['files', {'child': files}]);
            overwrites && children.push(['overwrites', {'child': overwrites}]);
        }

        super.setup(new Map(children));
        this.#hashes = new (require('./hashes'))(this);
    }

    /**
     * Create the internal module id based on the relative file of it
     * @param filename {string} The relative path of the internal module
     * @return {string}
     */
    createImID(filename) {
        let id = filename.replace(/\\/g, '/');
        id = `./${id}`;

        const extensions = ['.ts', '.map', '.d.ts', '.js', '.tsx'];
        for (const ext of extensions) {
            if (id.endsWith(ext)) {
                return id.substr(0, id.length - ext.length)
            }
        }
        return id;
    }

    _prepared(require) {
        if (!this.#configured) return;
        this.files?.forEach(source => require(source));
        this.overwrites?.forEach(source => require(source));
    }

    _build(diagnostics) {
        void (hmr);
        void (diagnostics);
        throw new Error('Method must be overridden');
    }

    _process() {
        const {compiler} = this.#packager;
        if (compiler && !compiler.valid) {
            this.#hashes.update();
            this.#diagnostics = compiler.diagnostics;
            return;
        }

        const diagnostics = this.#diagnostics = new (require('./diagnostics'))();
        const built = this._build(diagnostics);

        const {code, ims} = built ? built : {};
        this.#code = code;
        this.#ims = ims;

        this.#hashes.update();
    }

    configure(config) {
        if (equal(config, this.#config)) return;

        this.#config = config;
        this.#configured = true;
        this._invalidate();
    }
}
