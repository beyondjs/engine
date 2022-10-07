const DynamicProcessor = require('beyond/utils/dynamic-processor');
const equal = require('beyond/utils/equal');
const cspecs = require('beyond/cspecs');

module.exports = class extends DynamicProcessor() {
    get dp() {
        return 'bundler.bundle';
    }

    #values;

    /**
     * The name of the bundle specified in the module.json
     * If the bundle name is not specified, then the bundle type (ex: 'ts', 'sass', etc) is taken by default
     * @return {string}
     */
    get name() {
        return this.#values?.name;
    }

    /**
     * The path of the resource relative to the package, used as the exported value in the package.json
     * @return {string}
     */
    get subpath() {
        return this.#values?.subpath;
    }

    get specifier() {
        return this.#values?.specifier;
    }

    get vspecifier() {
        return this.#values?.vspecifier;
    }

    // The name of the bundle specified in the module.json
    get platforms() {
        return new Set(this.#values?.platforms);
    }

    get multilanguage() {
        return this.#values?.multilanguage;
    }

    _process({errors, warnings, config}) {
        const done = ({errors, warnings, values}) => {
            this.#errors = errors ? errors : [];
            this.#warnings = warnings ? warnings : [];
            this.#values = values;

            return equal(this.#errors, errors) && equal(this.#warnings, warnings) && equal(this.#values, values);
        }

        const {module, type} = this;

        const values = {};
        const name = values.name = typeof config.name === 'string' ? config.name : type;
        values.subpath = module.subpath + (module.bundles.size === 1 ? '' : `.${name}`);
        values.specifier = module.specifier + (module.bundles.size === 1 ? '' : `.${name}`);
        values.vspecifier = module.vspecifier + (module.bundles.size === 1 ? '' : `.${name}`);

        values.platforms = (() => {
            if (errors?.length) return [];

            let {all} = cspecs.platforms;
            let platforms = config.value.platforms ? config.value.platforms : all;
            platforms = typeof platforms === 'string' ? [platforms] : platforms;
            platforms = platforms instanceof Array ? platforms : all;
            platforms = platforms.includes('*') ? all : platforms;

            // Remove the platforms that are not included in the module
            return platforms.filter(platform => module.platforms.has(platform));
        })();

        return done({errors, warnings, values});
    }
}
