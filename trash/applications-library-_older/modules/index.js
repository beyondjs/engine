const DynamicProcessor = global.utils.DynamicProcessor(Map);
const AM = require('../../../module');

/**
 * The application modules (AM) of the library
 */
module.exports = class extends DynamicProcessor {
    get dp() {
        return 'application.library.modules';
    }

    #application;

    constructor(application, library) {
        super();
        this.#application = application;

        const children = new Map();
        children.set('modules', {child: library.modules});
        super.setup(children);
    }

    _process() {
        const modules = this.children.get('modules').child;

        const updated = new Map();
        modules.forEach(module => {
            const {id} = module;
            const am = this.has(id) ? this.get(id) : new AM(this.#application, module);
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
