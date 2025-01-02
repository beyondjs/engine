const DynamicProcessor = global.utils.DynamicProcessor(Map);

module.exports = class extends DynamicProcessor {
    get dp() {
        return 'application.imported.modules.resources';
    }

    #modules;

    #rpaths = new Map();
    get rpaths() {
        return this.#rpaths;
    }

    constructor(modules) {
        super();
        this.#modules = modules;
        super.setup(new Map([['modules', {child: modules}]]));
    }

    _prepared(require) {
        this.#modules.forEach(module => require(module));
    }

    _process() {
        this.clear();
        this.#modules.forEach(module => this.set(module.rpath, module));
    }
}
