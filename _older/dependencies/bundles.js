const DynamicProcessor = global.utils.DynamicProcessor(Map);

/**
 * Map with all the dependencies of the application. Actually required to build the application import_map.
 * Where the key of the map is the dependency specifier (specifier for internal packages,
 * and vspecifier for external bundles),
 * The value of the map is the url of the dependency
 */
module.exports = class extends DynamicProcessor {
    get dp() {
        return 'application.dependencies';
    }

    #application;
    #distribution;

    #diagnostics = new Map();
    get diagnostics() {
        return this.#diagnostics;
    }

    get importMap() {
        if (!this.processed) throw new Error('Object is not processed');

        const imports = {};
        this.forEach(({pathname}, resource) => imports[resource] = `${pathname}.js`);

        (() => {
            const distribution = this.#distribution;
            const baseDir = distribution.baseDir ? distribution.baseDir : '/';

            const required = ['@beyond-js/kernel/transversals', '@beyond-js/widgets/application'];
            distribution.local && required.push('@beyond-js/local/main');
            required.forEach(required => imports[required] = `${baseDir}packages/${required}.js`);
        })();

        return {imports};
    }

    constructor(application, distribution) {
        super();
        this.#application = application;
        this.#distribution = distribution;
        this.setMaxListeners(500); // how many bundles can have the same dependency

        super.setup(new Map([['modules', {child: application.modules}]]));
    }

    _prepared(require) {
        const modules = this.children.get('modules').child;
        modules.forEach(module => {
            if (!require(module) || !require(module.bundles)) return;
            module.bundles.forEach(bundle => {
                if (!require(bundle)) return;
                const packager = bundle.packagers.get(this.#distribution);
                if (!require(packager) || !require(packager.dependencies)) return;

                packager.dependencies.forEach(dependency => {
                    if (!require(dependency)) return;
                    if (dependency.kind === 'external') {
                        const recursive = external => {
                            if (!require(external)) return;
                            if (!require(external.dependencies)) return;
                            external.dependencies.forEach(external => recursive(external));
                        }

                        recursive(dependency.external);
                    }
                });
            });
        });
    }

    _process() {
        const diagnostics = new Map();
        const updated = new Map();
        const modules = this.children.get('modules').child;
        const distribution = this.#distribution;
        const {platform} = distribution;
        const baseDir = distribution.baseDir ? distribution.baseDir : '/';

        modules.forEach(module => module.bundles.forEach(bundle => {
            if (!bundle.platforms.has(platform)) return;

            const packager = bundle.packagers.get(distribution);
            packager.dependencies.forEach(dependency => {
                const {valid, errors, resource, internal, node, bundle, external, kind} = dependency;
                (!valid || !kind) && diagnostics.set(resource, {errors});
                if (internal || node) return;

                if (kind === 'external') {
                    const recursive = external => {
                        const resource = external.resource(distribution);
                        if (updated.has(resource)) return;

                        const pathname = external.pathname(distribution);
                        updated.set(resource, {kind, pathname});

                        const {dependencies} = external;
                        if (dependencies.errors?.length) {
                            diagnostics.set(resource, {warnings: dependencies.errors});
                            return;
                        }

                        dependencies.forEach(external => recursive(external));
                    }
                    recursive(external);
                }
                else if (kind === 'bundle') {
                    const pathname = `${baseDir}${bundle?.pathname}`;
                    updated.set(resource, {kind, pathname});
                }
            });
        }));

        this.clear();
        this.#diagnostics = diagnostics;
        updated.forEach((value, key) => this.set(key, value));
    }
}
