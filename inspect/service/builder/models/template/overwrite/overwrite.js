const Bundle = require('./models/bundle');
module.exports = class {
    _bundles = new Map();
    get bundles() {
        return this._bundles;
    }

    _BUNDLES = ['page', 'code', 'txt', 'static'];

    skeleton = [];

    constructor(id, bundles) {
        this._id = id;

        for (const bundle of Object.entries(bundles)) {
            const [bundleName, processors] = bundle;
            if (!this._BUNDLES.includes(bundleName)) {
                console.error(`Bundle ${bundleName} not valid`);
                return;
            }

            this._bundles.set(bundleName, new Bundle(bundleName, processors));
        }
    }

    getContent() {
        const json = {}, output = {};

        this.bundles.forEach(bundle => Object.assign(output, bundle.getContent()));

        json[this._id] = output;
        return json;
    }

    addBundle(bundle, specs) {
        this._bundles.set(bundle, new Bundle(bundle, specs));
    }

    deleteBundle(bundle) {
        this.bundles.has(bundle) ? this.bundles.delete(bundle) : null;
    }
}