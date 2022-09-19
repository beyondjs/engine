/**
 * Reads the package.json to find the module and typings of the external
 */
module.exports = class {
    #application;
    #id; // The package id
    get id() {
        return this.#id;
    }

    #js = new Map();
    get js() {
        return this.#js;
    }

    #dts;
    get dts() {
        return this.#dts;
    }

    #errors = [];
    get errors() {
        return this.#errors;
    }

    get valid() {
        return !this.#errors.length;
    }

    #warnings = [];
    get warnings() {
        return this.#warnings;
    }

    /**
     * External package constructor
     *
     * @param id {string} The package id
     * @param application {object} The application object
     */
    constructor(id, application) {
        this.#id = id;
        this.#application = application;
    }

    /**
     * Set external configuration
     *
     * @param config {{development?: string, production?: string}} The external configuration
     */
    configure(config) {
        if (!config) {
            this.#errors = [];
            this.#warnings = [];
            this.#js.clear();
            this.#dts = undefined;
            return;
        }

        const failed = errors => {
            this.#js.clear();
            this.#dts = undefined;
            this.#errors = errors;
        }

        // Resolve the dts, js and map files resolving from the package.json file
        let errors, path, module, typings;
        ({errors, path, module, typings} = require('./resolve')(this.#id, this.#application));
        if (errors) return failed(errors);

        // Define the js files for development and production
        let js, warnings;
        ({errors, warnings, js} = require('./js')(path, module, config));
        if (errors) return failed(errors);

        this.#warnings = warnings ? warnings : [];
        this.#js = js;

        let dts;
        ({errors, warnings, dts} = require('./dts')(this.#id, path, typings, this.#application));
        if (errors) return failed(errors);

        this.#errors = [];
        this.#dts = dts;
    }
}
