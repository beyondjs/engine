const DynamicProcessor = require('beyond/utils/dynamic-processor');
const Packagers = require('./packagers');
const {bundles: registry} = require('beyond/bundlers-registry');

module.exports = class extends DynamicProcessor() {
    get dp() {
        return 'module.exported.bundle';
    }

    get meta() {
        return registry.get('esbuild');
    }

    #packagers;
    get packagers() {
        return this.#packagers;
    }

    #conditional;
    #configured;

    #platforms;
    get platforms() {
        return this.#platforms;
    }

    constructor() {
        super();
        super.setup(new Map([['registry', {child: registry}]]));
        this.#packagers = new Packagers(this);
    }

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

    _prepared() {
        return !!this.#configured;
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

        this.#configured = true;
        this._invalidate();
    }

    destroy() {
        super.destroy();
        this.#packagers.destroy();
    }
}
