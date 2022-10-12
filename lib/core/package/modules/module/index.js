const {Config} = require('beyond/utils/config');
const {sep} = require('path');

module.exports = class extends require('./attributes') {
    #pkg;
    get pkg() {
        return this.#pkg;
    }

    #file;
    get file() {
        return this.#file;
    }

    get path() {
        return this.#file.dirname;
    }

    #id;
    get id() {
        return this.#id;
    }

    #errors = [];
    get errors() {
        return this.#errors;
    }

    #warnings = [];
    get warnings() {
        return this.#warnings;
    }

    #bundles;
    get bundles() {
        return this.#bundles;
    }

    #_static;
    get static() {
        return this.#_static;
    }

    constructor(finder, file) {
        const {pkg} = finder;
        if (!pkg || !file) throw new Error('Invalid parameters');

        const config = new Config(file.dirname, {'/static': 'object'});
        config.data = 'module.json';
        super(config);

        this.#pkg = pkg;
        this.#file = file;

        this.#bundles = new (require('./bundles'))(this);
        this.#_static = new (require('./static'))(this, config.properties.get('static'));

        let path = file.relative.dirname;
        path = sep === '/' ? path : path.replace(/\\/g, '/');
        path = path.replace(/\/$/, ''); // Remove trailing slash;
        this.#id = `${pkg.id}` + (path ? `//${path}` : '//main');
    }

    _process() {
        const {config, errors, warnings} = (() => {
            const config = this.children.get('config').child;
            const {errors, warnings, valid} = config;
            const value = valid && config.value ? require('./process-config')(config.value) : {bundles: {}};

            return {config: value, errors, warnings};
        })();
        this.#errors = errors;
        this.#warnings = warnings;

        const changed = super._process(config, errors);

        // Configure the bundles
        this.#bundles.configure(config.bundles);

        return changed;
    }

    destroy() {
        super.destroy();
        this.#_static.destroy();
    }
}
