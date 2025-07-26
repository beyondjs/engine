const Overwrite = require('./overwrite');
module.exports = class extends require('../../file-manager') {
    #items = new Map();
    get items() {
        return this.#items;
    }

    skeleton = [];

    constructor(path, template) {
        super(path);
        this._template = template;

        if (!this.validate()) return;

        const content = this.readJSON();
        Object.entries(content).forEach(([key, value]) =>
            this.#items.set(key, new Overwrite(key, value))
        );
    }

    async save() {
        await this._writeJSON(this._getFilePath(), this.getContent());
    }

    getContent() {
        const json = {};
        this.items.forEach(item => Object.assign(json, item.getContent()));
        return json;
    }

    setValues(overwrites) {
        const buildSpecs = config => {
            const {module, bundle, processor, path, files} = config;

            const specs = {};
            specs[bundle] = {path: path};
            if (processor) {
                specs[bundle][processor] = {};
                specs[bundle][processor].files = (files instanceof Array) ? files : [files];
            }
            else {
                if (bundle === 'static') specs[bundle] = config[bundle];
                else specs[module][bundle] = files;
            }
            return specs;
        }

        overwrites.forEach(config => {
            const overwrite = this.items.get(config.module);

            if (!overwrite) {
                this.#items.set(config.module, new Overwrite(config.module, buildSpecs(config)));
                return;
            }

            if (!overwrite.bundles.has(config.bundle)) {
                overwrite.addBundle(config.bundle, buildSpecs(config));
                return;
            }

            const bundle = overwrite.bundles.get(config.bundle);
            bundle.setValues(config);
        });
    }
}