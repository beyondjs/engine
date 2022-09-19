const DynamicProcessor = global.utils.DynamicProcessor(Map);
const AM = require('../../../module');

/**
 * The application modules (AM) of the imported project
 */
module.exports = class extends DynamicProcessor {
    get dp() {
        return 'application.imported.modules';
    }

    #al;

    get path() {
        return this.children.get('modules').child?.path;
    }

    #resources;
    get resources() {
        return this.#resources;
    }

    /**
     * Imported project modules collection constructor
     *
     * @param al {object} The application library
     */
    constructor(al) {
        super();
        this.#al = al;
        this.#resources = new (require('./resources'))(this);

        super.setup(new Map([['al', {child: al}]]));
    }

    _prepared(require) {
        const {children} = this;
        const modules = this.#al.legacy ? this.#al.library?.modules : this.#al.library?.modules.self;

        if (children.has('modules')) {
            if (children.get('modules').child === modules) return;
            children.unregister(['modules']);
        }
        if (!modules) return;

        children.register(new Map([['modules', {child: modules}]]));
        require(modules);
    }

    _process() {
        const {children} = this;
        const modules = children.has('modules') ? children.get('modules').child : void 0;

        const updated = new Map();
        modules?.forEach(module => {
            const {id} = module;

            // The module object of the legacy libraries is 'module', if the library is an imported project
            // then the module is an 'application.module'
            const m = this.#al.legacy ? module : module.module;
            const am = this.has(id) ? this.get(id) : new AM(this.#al.application, m);
            updated.set(id, am);
        });

        // Destroy unused modules
        this.forEach((module, key) => !updated.has(key) && module.destroy());

        super.clear(); // Do not use this.clear() as it would destroy reused modules
        updated.forEach((value, key) => this.set(key, value));
    }

    clear() {
        this.forEach(module => module.destroy());
        super.clear();
    }

    destroy() {
        super.destroy();
        this.clear();
    }
}
