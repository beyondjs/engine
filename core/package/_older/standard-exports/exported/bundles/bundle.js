const DynamicProcessor = require('beyond/utils/dynamic-processor');
const Packagers = require('./packagers');
const registry = require('beyond/plugins/registry');

module.exports = class extends DynamicProcessor() {
    get dp() {
        return 'module.exported.bundle';
    }

    get meta() {
        return registry.bundles.get('esbuild');
    }

    #module;
    get module() {
        return this.#module;
    }

    #name;
    get name() {
        return this.#name;
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

    #packagers;
    get packagers() {
        return this.#packagers;
    }

    #platforms;
    get platforms() {
        return this.#platforms;
    }

    #conditional;
    #configured;

    constructor(module, name) {
        super();
        this.#module = module;
        this.#name = name;
        this.#subpath = module.subpath + (name ? `.${name}` : '');
        this.#specifier = this.#module.specifier + (name ? `.${name}` : '');
        this.#vspecifier = this.#module.vspecifier + (name ? `.${name}` : '');

        super.setup(new Map([['registry', {child: registry.bundles}]]));
        this.#packagers = new Packagers(this);
    }

    conditional({platform, kind}) {
        const order = (() => {
            if (platform === 'browser') return ['browser', 'module', 'default'];
            if (platform === 'node') return ['node', 'module', 'default'];
            if (platform === 'deno') return ['deno', 'module', 'default'];
        })();

        const conditional = this.#conditional;
        const found = order.find(condition => conditional.has(condition) && conditional.get(condition));
        return found ? conditional.get(found) : void 0;
    }

    _prepared() {
        return !!this.#configured;
    }

    configure(conditional) {
        conditional = typeof conditional === 'string' ? {default: conditional} : conditional;
        conditional = typeof conditional === 'object' ? conditional : {};

        this.#conditional = new Map(Object.entries(conditional));

        this.#platforms = (() => {
            const conditional = this.#conditional;

            if (conditional.has('default')) return new Set(['browser', 'node', 'deno']);

            const platforms = new Set();
            conditional.has('browser') && platforms.add('browser');
            conditional.has('node') && platforms.add('node');
            conditional.has('deno') && platforms.add('deno');
            return platforms;
        })();

        this.#configured = true;
        this._invalidate();
    }

    destroy() {
        super.destroy();
        this.#packagers.destroy();
    }
}
