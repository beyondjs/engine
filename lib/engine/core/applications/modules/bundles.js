const DynamicProcessor = global.utils.DynamicProcessor(Map);

module.exports = class extends DynamicProcessor {
    get dp() {
        return 'application.modules.bundles';
    }

    #specifiers = new Set();
    get specifiers() {
        return this.#specifiers;
    }

    constructor(modules) {
        super();
        super.setup(new Map([['modules', {child: modules}]]));
    }

    _prepared(require) {
        const modules = this.children.get('modules').child;
        modules.forEach(module => {
            if (!require(module) || !require(module.bundles)) return false;
            module.bundles.forEach(bundle => require(bundle));
        });
    }

    _process() {
        const modules = this.children.get('modules').child;

        const updated = {platforms: new Map(), specifiers: new Set()};
        modules.forEach(module => module.bundles.forEach(bundle => {
            if (bundle.errors?.length) return;
            updated.specifiers.add(bundle.specifier);
            if (!bundle.valid) return;
            bundle.platforms.forEach(platform => updated.platforms.set(`${bundle.specifier}//${platform}`, bundle));
        }));

        const changed = (() => {
            if (this.size !== updated.platforms.size) return true;
            if (this.#specifiers.size !== updated.specifiers.size) return true;

            let changed;
            changed = [...this].reduce((prev, [key, value]) =>
                prev || !updated.platforms.has(key) || updated.platforms.get(key) !== value, false);
            if (changed) return true;

            changed = [...this.#specifiers].reduce((prev, specifier) => prev || !updated.specifiers.has(specifier), false);
            return changed;
        })();
        if (!changed) return false;

        this.#specifiers.clear();
        this.clear();
        updated.platforms.forEach((bundle, key) => this.set(key, bundle));
        updated.specifiers.forEach(specifier => this.#specifiers.add(specifier));
    }
}
