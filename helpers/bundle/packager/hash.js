const DynamicProcessor = global.utils.DynamicProcessor();
const {crc32, equal} = global.utils;

module.exports = class extends DynamicProcessor {
    get dp() {
        return 'bundler.bundle.packager.hash';
    }

    #packager;
    get packager() {
        return this.#packager;
    }

    #value;
    get value() {
        return this.#value;
    }

    constructor(packager) {
        super();
        this.#packager = packager;
        const {bundle, bundle: {module}, processors} = packager;

        const children = new Map([
            ['bundles', {child: bundle.container.bundles}],
            ['processors.inputs.hash', {child: processors.hashes.inputs}],
            ['deprecated-imports', {child: bundle.imports.hash}]
        ]);

        /**
         * The dependencies.packages are the dependencies as they are configured in the package.json,
         * plus the application libraries.
         * If a change occurs in the dependencies, then reprocess the packager.
         *
         * It is also only required in local environment to support dynamic imports,
         * (as it is needed to know the version of the packages).
         */
        children.set('dependencies.packages', {child: module.container.dependencies.packages});

        super.setup(children);
    }

    async _begin() {
        await this.#packager.ready;
    }

    _process() {
        const bundles = this.children.get('bundles').child;
        const imports = this.children.get('deprecated-imports').child;
        const multilanguage = bundles.size > 1 ? 1 : 0;

        /**
         * The dependencies.packages hash value is required in local environment to support dynamic imports
         * @type {{multilanguage: number, imports, processors, dependencies}}
         */
        const compute = {
            processors: this.children.get('processors.inputs.hash').child.value,
            ['dependencies.packages']: this.children.get('dependencies.packages').child.hash,
            multilanguage,
            imports: imports.value // The deprecated imports (imports entry in the module.json)
        };
        const value = crc32(equal.generate(compute));
        const changed = this.#value !== value;
        this.#value = value;

        return changed;
    }
}
