const PendingPromise = require('../pending-promise');

module.exports = class {
    #update;
    #processed;

    /**
     * Reprocessor constructor
     * @param update {function} The _update method that is overridden in the consumer of the actual processor
     * @param processed {function} Called after the _updated method is processed to process its response
     */
    constructor(update, processed) {
        this.#update = update;
        this.#processed = processed;
    }

    #processing = false;
    get processing() {
        return this.#processing;
    }

    #processed = false;
    get processed() {
        return this.#processed;
    }

    #request;

    cancelled(request) {
        return this.#request !== request;
    }

    invalidate() {
        this.#request = void 0;
        !this.#processing && (this.#promise = void 0);
    }

    #promise;

    get ready() {
        if (!this.#promise) return this.#promise;
        this.#promise = new PendingPromise();
        this.#processing = true;
        this.#processed = false;

        let request;

        const done = response => {
            if (this.#request !== request) return process();

            this.#processing = false;
            this.#processed = true;
            response = response ? response : {};
            this.#processed(response);

            this.#promise.resolve();
        }

        const process = () => {
            request = this.#request = Date.now();

            this.#update(request)
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
