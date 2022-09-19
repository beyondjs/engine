const DynamicProcessor = global.utils.DynamicProcessor();
const fs = (require('../../fs'));
const chokidar = require('chokidar');

module.exports = class extends DynamicProcessor {
    get dp() {
        return 'utils.config.property.file';
    }

    #watcher;

    // The path of the parent property, or the specified path when the property is the root
    #root;
    get root() {
        return this.#root;
    }

    // The relative path of the configuration file specified from the data of the property when the data is a string
    #relative;
    get relative() {
        return this.#relative;
    }

    // The full path of the file (root + relative)
    #file;
    get file() {
        return this.#file;
    }

    #dirname;
    get dirname() {
        if (this.#dirname !== void 0) return this.#dirname;
        return this.#dirname = require('path').dirname(this.#file);
    }

    #errors = [];
    get errors() {
        return this.#errors;
    }

    get valid() {
        return !this.errors.length;
    }

    #value;
    get value() {
        return this.#value;
    }

    /**
     * File constructor
     *
     * @param root {string} The path of the parent property, or the specified path when the property is the root
     * @param relative {string} The data of the property when the data is a string
     */
    constructor(root, relative) {
        super();
        this.#root = root;
        this.#relative = relative;
        this.#file = require('path').join(root, relative);
    }

    async _begin() {
        // Watch for file changes
        this.#watcher = chokidar.watch(this.#file, {'ignoreInitial': true});
        this.#watcher.on('all', this._invalidate);
    }

    async _process(request) {
        this.#value = undefined;

        const done = ({value, errors}) => {
            errors = typeof errors === 'string' ? [errors] : errors;
            this.#errors = errors ? errors : [];
            this.#value = value;
        }

        const exists = (await fs.exists(this.#file)) && (await fs.stat(this.#file)).isFile();
        if (this._request !== request) return;
        if (!exists) return done({errors: `Configuration file "${this.#file}" not found`});

        const content = await fs.readFile(this.#file, {'encoding': 'UTF8'});
        if (this._request !== request) return;

        let value;
        try {
            value = JSON.parse(content);
            return done({value});
        }
        catch (exc) {
            return done({errors: `Configuration file "${this.#file}" cannot be parsed - ${exc.message}`});
        }
    }

    destroy() {
        super.destroy();
        this.#watcher?.close().catch(exc => console.error(exc.stack));
        this.#watcher?.removeAllListeners();
    }
}
