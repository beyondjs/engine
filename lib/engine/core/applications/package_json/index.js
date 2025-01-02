const DynamicProcessor = global.utils.DynamicProcessor();
const fs = require('fs').promises;

module.exports = class extends DynamicProcessor {
    get dp() {
        return 'application.package_json';
    }

    #application;
    #listener;

    #listen() {
        const {path, watcher} = this.#application;
        this.#listener = watcher.listeners.create(path, {includes: ['package.json']});
        this.#listener.listen().catch(exc => console.log(exc.stack));
        this.#listener.on('change', this._invalidate);
    }

    #json;
    get json() {
        return this.#json;
    }

    #hash;
    get hash() {
        return this.#hash;
    }

    #errors = [];
    get errors() {
        return this.#errors;
    }

    get valid() {
        return !this.#errors.length;
    }

    async _process(request) {
        this.#errors = [];
        this.#json = void 0;

        const file = require('path').join(this.#application.path, 'package.json');
        try {
            await fs.access(file);
            if (request !== this._request) return;
        }
        catch (exc) {
            this.#errors = 'package.json file not found';
            return;
        }

        let content;
        try {
            content = await fs.readFile(file, 'utf8');
            if (request !== this._request || !content) return;
        }
        catch (exc) {
            this.#errors.push(`Error reading package.json file: ${exc.message}`);
            return;
        }

        try {
            this.#json = JSON.parse(content);
        }
        catch (exc) {
            this.#errors.push(`Error parsing package.json file: ${exc.message}`);
        }
    }

    constructor(application) {
        super();
        this.#application = application;
        this.#listen();
    }

    destroy() {
        super.destroy();
        this.#listener?.destroy();
    }
}
