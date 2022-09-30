const {fs} = global.utils;

module.exports = class {
    #path;
    #specs = new Map();

    constructor(path) {
        this.#path = require('path').join(path, 'actions.specs.json');
    }

    async process(module, distribution, builder) {
        const platforms = distribution.npm ? Object.keys(distribution.npm.platforms) : [distribution.platform];
        if (!platforms.find(p => p === 'backend')) return;

        await module.bundles.ready;
        if (!module.bundles.has('bridge')) return;

        const bundle = module.bundles.get('bridge');
        const packager = await bundle.packagers.get(distribution);
        await packager.processors.ready;
        if (!packager.processors.has('ts')) return;

        const {analyzer} = packager.processors.get('ts');
        await analyzer.ready;

        const {bridges} = analyzer;
        if (!bridges) return;

        builder.emit('message', `  . Building bridge specification of "${bundle.subpath}"`);

        const exports = [...bridges].map(([key, methods]) => [key, [...methods]]);
        this.#specs.set(bundle.specifier, exports);
    }

    async save() {
        const specs = [...this.#specs];
        await fs.save(this.#path, JSON.stringify(specs, null, 2));
    }
}

