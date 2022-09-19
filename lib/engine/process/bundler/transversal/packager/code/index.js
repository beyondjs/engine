const DynamicProcessor = global.utils.DynamicProcessor();
const {minify} = require('uglify-js');
const mformat = require('beyond/mformat');

module.exports = class extends DynamicProcessor {
    get dp() {
        return 'bundler.transversal.packager.code';
    }

    get id() {
        return this.#tp.id;
    }

    // The transversal packager
    #tp;
    get tp() {
        return this.#tp;
    }

    #errors;
    get errors() {
        this.#process();
        return this.#errors ? this.#errors : [];
    }

    get valid() {
        return !this.errors.length;
    }

    #warnings;
    get warnings() {
        return this.#warnings ? this.#warnings : [];
    }

    #code;
    #map;

    code() {
        this.#process();
        return this.#code;
    }

    map() {
        this.#process();
        return this.#map;
    }

    _generate() {
        const packagers = this.children.get('packagers.code').child;
        const {count, code, map} = packagers;

        const sourcemap = new global.SourceMap();
        sourcemap.concat('const bundles = [];');
        count && sourcemap.concat(code, void 0, map);
        sourcemap.concat('__beyond_transversal.initialise(bundles);\n\n');

        return {sourcemap};
    }

    _post(sourcemap) {
        return sourcemap;
    }

    _process() {
        this.#code = this.#map = this.#errors = this.#warnings = undefined;
    }

    #process() {
        if (this.#code || this.#errors) return; // Already processed
        if (!this.processed) throw new Error('Dynamic processor is not ready');

        const dependencies = this.children.get('dependencies.code').child;
        const packagers = this.children.get('packagers.code').child;
        if (!dependencies.valid || !packagers.valid) {
            this.#code = this.#map = undefined;
            this.#warnings = [];
            this.#errors = [].concat(dependencies.errors, packagers.errors);
            return;
        }

        let {sourcemap: generated, errors, warnings} = this._generate();
        this.#errors = errors;
        this.#warnings = warnings;
        if (errors) return;

        let sourcemap = new global.SourceMap();
        dependencies.count && sourcemap.concat(dependencies.code);

        const {transversal} = this.#tp;
        const {multilanguage} = transversal;
        const language = `, '${multilanguage ? this.#tp.language : ''}'`;
        const params = `'${transversal.name}'${language}`;

        sourcemap.concat(`const {Transversal} = brequire('@beyond-js/kernel/transversals');\n`);
        sourcemap.concat(`export const __beyond_transversal = new Transversal(${params});`);

        // Register the dependencies of the transversal
        (() => {
            const imports = [];
            [...dependencies]
                .filter(([specifier]) => specifier !== '@beyond-js/kernel/bundle')
                .forEach(([specifier, name]) => imports.push(`['${specifier}', ${name}]`));

            const code = `[${imports.join(',')}]`;
            sourcemap.concat(`__beyond_transversal.dependencies.update(${code});\n`);
        })();

        sourcemap.concat(generated.code, void 0, generated.map);

        // Transform to module system type according to distribution configuration
        const {mode} = this.#tp.distribution.bundles;

        let map, code;
        ({errors, map, code} = mformat({code: sourcemap.code, map: sourcemap.map, mode}));
        this.#errors = errors;
        if (this.#errors) return;

        // Post process. Required for the start bundle to prepend the requirejs config
        const response = this._post({code, map});
        if (!response) throw new Error(`Transversal packager "${transversal.name}" _post method returned undefined`);

        ({errors, code, map} = response);
        this.#errors = errors;
        if (this.#errors) return;

        // Minify the .js bundle
        ({code, map} = (() => {
            const {distribution} = this.#tp;
            if (!distribution.minify?.js) return {code, map};

            ({code, map} = minify(code, {sourceMap: {content: map}}));
            map = typeof map === 'string' ? JSON.parse(map) : map;
            return {code, map};
        })());

        this.#code = code;
        this.#map = map;
    }

    constructor(tp, packagers) {
        super();
        this.#tp = tp;

        super.setup(new Map([
            ['packagers.code', {child: packagers.code}],
            ['dependencies.code', {child: tp.dependencies.code}]
        ]))
    }
}
