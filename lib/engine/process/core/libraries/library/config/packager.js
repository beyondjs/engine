const DynamicProcessor = global.utils.DynamicProcessor();
const mformat = require('beyond/mformat');
const {equal} = global.utils;

module.exports = class extends DynamicProcessor {
    get dp() {
        return 'library.config';
    }

    #distribution;

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

    constructor(library, distribution) {
        super();
        this.#distribution = distribution;

        super.setup(new Map([
            ['library', {child: library}],
            ['distribution', {child: distribution}],
            ['backend', {child: new (require('./backend'))(library)}]
        ]));
    }

    #previous;

    _process() {
        const library = this.children.get('library').child;
        const backend = this.children.get('backend').child;
        if (!library.processed || !backend.processed) {
            throw new Error('Project is not ready. Wait for the .ready property before calling this property.');
        }

        this.#errors = [];
        this.#code = void 0;

        const config = {
            package: library.package,
            version: library.version
        };

        backend.host && (config.backend = backend.host);

        // Check if library configuration has changed
        if (equal(this.#previous = config)) return false;
        this.#previous = config;

        let code = `export default ${JSON.stringify(config)};\n`;

        let map, errors;
        const {mode} = this.#distribution.bundles;
        ({code, map, errors} = mformat({code, mode}));

        this.#code = code;
    }
}
