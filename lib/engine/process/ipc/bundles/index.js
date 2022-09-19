module.exports = class {

    //Legacy Bundles
    legacy = ['js', 'jsx', 'page', 'layout'];

    async get(ids) {
        await global.bundles.ready;

        const output = {};
        for (const id of ids) {
            if (!global.bundles.has(id)) continue;
            const bundle = global.bundles.get(id);
            output[bundle.name] = {
                id: bundle.name,
                name: bundle.name,
                processors: bundle.processors,
                multilanguage: bundle.multilanguage
            };
        }

        return output;
    }

    async list() {
        await global.bundles.ready;

        const output = {};
        global.bundles.forEach(bundle => {
            if (this.legacy.includes(bundle.name)) return;
            output[bundle.name] = {
                id: bundle.name,
                name: bundle.name,
                processors: bundle.processors,
                multilanguage: bundle.multilanguage
            }
        });

        return output;
    }
}