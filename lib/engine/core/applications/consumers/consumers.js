const DynamicProcessor = global.utils.DynamicProcessor(Map);

/**
 * Map with all the consumers of the bundles of the modules of the application
 * Where the key of the map is the bundle.id, and the value is a set of bundle objects
 */
module.exports = class extends DynamicProcessor {
    get dp() {
        return 'application.consumers';
    }

    #distribution;
    #language;

    constructor(application, distribution, language) {
        super();
        this.#distribution = distribution;
        this.#language = language;
        this.setMaxListeners(500); // how many bundles can have the same dependency

        super.setup(new Map([['modules', {child: application.modules}]]));
    }

    _prepared(require) {
        const modules = this.children.get('modules').child;
        modules.forEach(module => {
            if (!require(module) || !require(module.bundles)) return;
            module.bundles.forEach(bundle => {
                if (!require(bundle)) return;
                const packager = bundle.packagers.get(this.#distribution, this.#language);
                if (!require(packager) || !require(packager.dependencies)) return;
                packager.dependencies.forEach(dependency => require(dependency));
            });
        });
    }

    _process() {
        const updated = new Map();
        const modules = this.children.get('modules').child;
        modules.forEach(module => module.bundles.forEach(bundle => {
            const packager = bundle.packagers.get(this.#distribution, this.#language);
            packager.dependencies.forEach(dependency => {
                if (dependency.external || dependency.internal || dependency.node || !dependency.valid) return;
                if (dependency.bundle.specifier.startsWith('@beyond-js/')) return;

                const consumers = updated.has(dependency.bundle.id) ? updated.get(dependency.bundle.id) : new Set();
                updated.set(dependency.bundle.id, consumers);
                consumers.add(bundle);
            });
        }));

        this.clear();
        updated.forEach((value, key) => this.set(key, value));
    }
}
