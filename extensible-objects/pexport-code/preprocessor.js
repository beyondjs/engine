const Reprocessor = require('beyond/utils/reprocessor');

module.exports = class extends Reprocessor {
    #data;
    get data() {
        return this.#data;
    }

    #hash;
    get hash() {
        return this.#hash;
    }

    #code;
    #process;

    #errors = [];
    get errors() {
        return this.#errors;
    }

    get valid() {
        return !this.#errors.length;
    }

    #warnings;
    get warnings() {
        return this.#warnings;
    }

    get updated() {
        return this.#code.hash === this.#hash;
    }

    constructor(code, process) {
        super();
        this.#code = code;
        this.#process = process;
    }

    get ready() {
        return new Promise((resolve, reject) => {
            this.#code.ready
                .then(() => {
                    if (this.updated) return;
                    return super.ready;
                })
                .then(resolve)
                .catch(exc => reject(exc));
        });
    }

    async _process(request) {
        const processed = await this.#process(request);
        if (this.cancelled(request)) return;

        this.#data = processed;
        this.#errors = processed.errors ? processed.errors : [];
        this.#warnings = processed.warnings ? processed.warnings : [];
        this.#hash = this.#code.hash;
    }
}
