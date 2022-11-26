const PendingPromise = require('../pending-promise');

let autoincremental = {id: 0, request: 0};

module.exports = class {
    #processing = false;
    get processing() {
        return this.#processing;
    }

    #processed = false;
    get processed() {
        return this.#processed;
    }

    #autoincremented = autoincremental.id++;
    get autoincremented() {
        return this.#autoincremented;
    }

    #request;
    get request() {
        return this.#request;
    }

    cancelled(request) {
        return this.#request !== request;
    }

    invalidate() {
        this.#request = void 0;
        !this.#processing && (this.#promise = void 0);
    }

    #promise;

    async _process(request) {
        void request;
        throw new Error('Method ."_process" must be overridden');
    }

    _done(data) {
        void data;
    }

    get ready() {
        if (this.#promise) return this.#promise;
        this.#promise = new PendingPromise();
        this.#processing = true;
        this.#processed = false;

        let request;

        const done = response => {
            if (this.#request !== request) return process();

            this.#processing = false;
            this.#processed = true;
            response = response ? response : {};
            this._done?.(response);

            this.#promise.resolve();
        }

        const process = () => {
            request = this.#request = {is: 'reprocessor', value: autoincremental.request++};

            this._process(request)
                .then(done)
                .catch(exc => {
                    console.log(exc.stack);
                    done({errors: [`Exception caught: ${exc.message}`]})
                });
        }
        process();

        return this.#promise;
    }
}
