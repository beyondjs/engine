const DynamicProcessor = require('beyond/utils/dynamic-processor');
const Packagers = require('./packagers');
const registry = require('beyond/native-bundlers/bundles');

module.exports = class extends DynamicProcessor() {
    get dp() {
        return 'module.exported';
    }

    #pkg;

    get id() {
        return `${this.#pkg.id}//${this.#subpath}`;
    }

    #errors = [];
    get errors() {
        return this.#errors;
    }

    get valid() {
        return !this.#errors.length;
    }

    #warnings = [];
    get warnings() {
        return this.#warnings;
    }

    #subpath;
    get subpath() {
        return this.#subpath;
    }

    #specifier;
    get specifier() {
        return this.#specifier;
    }

    #vspecifier;
    get vspecifier() {
        return this.#vspecifier;
    }

    #platforms;
    get platforms() {
        return this.#platforms;
    }

    #conditional;

    conditional({platform, kind}) {
        const order = (() => {
            if (platform === 'web') return ['browser', 'module', 'default'];
            if (platform === 'node') return ['node', 'module', 'default'];
            if (platform === 'deno') return ['deno', 'module', 'default'];
        })();

        const conditional = this.#conditional;
        const found = order.find(condition => conditional.has(condition) && conditional.get(condition));
        return found ? conditional.get(found) : void 0;
    }

    get meta() {
        return registry.get('esbuild');
    }

    #packagers;
    get packagers() {
        return this.#packagers;
    }

    constructor(pkg, subpath) {
        super();
        this.#pkg = pkg;
        this.#subpath = subpath;
        this.#specifier = pkg.specifier + (subpath === '.' ? '' : subpath.slice(1));
        this.#vspecifier = pkg.vspecifier + (subpath === '.' ? '' : subpath.slice(1));

        this.#packagers = new Packagers(this);
    }

    configure(conditional) {
        conditional = typeof conditional === 'string' ? {default: conditional} : conditional;
        conditional = typeof conditional === 'object' ? conditional : {};

        this.#conditional = new Map(Object.entries(conditional));

        this.#platforms = (() => {
            const conditional = this.#conditional;

            if (conditional.has('default')) return new Set(['web', 'node', 'deno']);

            const platforms = new Set();
            conditional.has('browser') && platforms.add('web');
            conditional.has('node') && platforms.add('node');
            conditional.has('deno') && platforms.add('deno');
            return platforms;
        })();
    }

    destroy() {
        super.destroy();
        this.#packagers.destroy();
    }
}
