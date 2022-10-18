const DynamicProcessor = global.utils.DynamicProcessor();
const {crc32} = global.utils;

module.exports = class extends DynamicProcessor {
    get dp() {
        return 'ts.dependency.declaration';
    }

    #errors = [];
    get errors() {
        return this.#errors;
    }

    get valid() {
        return !this.errors.length;
    }

    // value only applies when the dependency is a bundle (not an external)
    #value;
    get value() {
        return this.#value;
    }

    #hash;
    get hash() {
        return this.#hash;
    }

    get dependency() {
        return this.children.get('dependency').child;
    }

    constructor(dependency) {
        super();
        super.setup(new Map([['dependency', {child: dependency}]]));
    }

    _prepared() {
        const {dependency} = this;
        const {valid, external, bundle, distribution, language} = dependency;
        const {declaration} = bundle ? bundle.packagers.get(distribution, language) : {};

        const {children} = this;
        const previous = {
            declaration: children.has('declaration') ? children.get('declaration').child : void 0,
            external: children.has('external') ? children.get('external').child : void 0
        };

        // Unregister previous bundle declaration or external if differs from actual values
        previous.declaration && declaration !== previous.declaration && children.unregister(['declaration']);
        previous.external && external !== previous.external && children.unregister(['external']);

        if (!valid) return;

        // Register declaration if not previously registered
        if (declaration && declaration !== previous.declaration) {
            children.register(new Map([['declaration', {child: declaration}]]));
        }

        // Register external if not previously registered
        if (external && external !== previous.external) {
            children.register(new Map([['external', {child: external}]]));
        }
    }

    _process() {
        this.#value = this.#hash = void 0;
        this.#errors = [];

        const {dependency} = this;
        if (!dependency.valid) {
            this.#errors = dependency.errors;
            return;
        }

        const {children} = this;
        const external = children.has('external') ? children.get('external').child : void 0;
        const declaration = children.has('declaration') ? children.get('declaration').child : void 0;

        if (external?.node) {
            this.#hash = 0;
        }
        else if (external) {
            this.#hash = crc32(external.version ? external.version : external.path);
        }
        else if (declaration) {
            this.#errors = declaration.errors;
            if (!declaration.valid) return;

            this.#value = declaration.code;
            this.#hash = declaration.hash;
        }
    }
}
