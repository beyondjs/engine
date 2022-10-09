const {bundles} = require('beyond/bundlers-registry');

module.exports = class {
    //Legacy Bundles
    legacy = ['js', 'jsx', 'page', 'layout'];

    async get(ids) {
        await bundles.ready;

        const output = {};
        for (const id of ids) {
            if (!bundles.has(id)) continue;
            const bundle = bundles.get(id);
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
        await bundles.ready;

        const output = {};
        bundles.forEach(bundle => {
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
