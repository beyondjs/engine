const DynamicProcessor = global.utils.DynamicProcessor(Map);

module.exports = class extends DynamicProcessor {
    get dp() {
        return 'sass.dependency.files';
    }

    #errors = [];
    get errors() {
        return this.#errors;
    }

    get valid() {
        return !this.errors.length;
    }

    #files;

    get hash() {
        return this.children.get('hash')?.child.value;
    }

    get dependency() {
        return this.children.get('dependency').child;
    }

    constructor(dependency) {
        super();
        super.setup(new Map([['dependency', {child: dependency}]]));
    }

    _prepared(require) {
        const {dependency} = this;
        const {valid, bundle, distribution, language} = dependency;
        const {processors} = bundle ? bundle.packagers.get(distribution, language) : {};
        if (!processors || (processors && !require(processors))) return;

        this.#files = processors.has('sass') ? processors.get('sass').files : void 0;
        const hash = this.#files?.hash;

        const {children} = this;
        const previous = children.has('hash') ? children.get('hash').child : void 0;

        // Unregister previous bundle declaration or external if differs from actual values
        previous && hash !== previous && children.unregister(['hash']);

        if (!valid || !bundle) return;

        hash !== previous && children.register(new Map([['hash', {child: hash}]]));
    }

    _process() {
        this.clear();
        if (!this.valid) return;

        const files = this.#files;
        files?.forEach((value, key) => this.set(key, value));
    }
}
