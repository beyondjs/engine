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
        this.#hash = this.#code.hash;
    }
}
