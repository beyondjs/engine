const DynamicProcessor = global.utils.DynamicProcessor();
const mformat = require('beyond/mformat');

/**
 * Process the processor HMR code
 */
module.exports = class extends DynamicProcessor {
    get dp() {
        return 'bundler.bundle.processor.hmr';
    }

    #errors = [];
    get errors() {
        return this.#errors;
    }

    get valid() {
        return !this.#errors.length;
    }

    #packager;
    #sourcemap;

    get code() {
        return this.#sourcemap?.code;
    }

    get map() {
        return this.#sourcemap?.map;
    }

    constructor(packager) {
        super();
        this.notifyOnFirst = true;
        this.#packager = packager;

        const {dependencies, js} = packager;
        const children = new Map([['code', {child: js}]]);
        dependencies && children.set('dependencies', {child: dependencies.code});
        super.setup(children);
    }

    _process() {
        const packager = this.#packager;

        const {dependencies, distribution, language} = packager;
        const {bundle} = packager.processor.specs;
        const {mode} = distribution.bundles;

        this.#sourcemap = void 0;
        const sourcemap = new (require('./sourcemap'));

        dependencies && sourcemap.concat(dependencies.code.code);

        let code = packager.js.hmr;
        code = typeof code === 'string' ? {code: code} : code;
        if (!code || !code.code) return;

        const multilanguage = language !== '.';
        const params = `'${bundle.specifier}', ${multilanguage}, {}` +
            (dependencies?.size ? ', dependencies' : '');

        sourcemap.concat(`const {beyond} = globalThis;`);
        sourcemap.concat(`const bundle = beyond.bundles.obtain(${params});`);
        sourcemap.concat(`const __pkg = bundle.package(${multilanguage ? `'${language}'` : ''});`);

        sourcemap.concat(code.code, code.map);

        let map, errors;
        ({code, map, errors} = mformat({code: sourcemap.code, map: sourcemap.map, mode}));
        if (errors) {
            this.#errors = errors;
            return;
        }

        this.#sourcemap = {code, map};
    }
}
