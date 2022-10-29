const PendingPromise = require('../pending-promise');

module.exports = class {
    #update;

    /**
     * Reprocessor constructor
     * @param update {function} The _update method that is overridden in the consumer of the actual processor
     */
    constructor(update) {
        this.#update = update;
    }

    #working = false;
    get working() {
        return this.#working;
    }

    #done = false;
    get done() {
        return this.#done;
    }

    #request;
    get request() {
        return this.#request;
    }

    #promise;

    invalidate() {
        this.#request = void 0;
        !this.#working && (this.#promise = void 0);
    }

    /**
     * This method should be overridden to process the data received from the update method
     * @param response
     */
    processed(response) {
        void response;
    }

    async process() {
        if (this.#promise) return await this.#promise;
        this.#promise = new PendingPromise();
        const request = this.#request = Date.now();

        this.#working = true;
        this.#done = false;
        this.#code = this.#map = void 0;
        this.#errors = [];
        this.#warnings = [];

        const done = response => {
            if (this.#request !== request) return process();

            this.#working = false;
            this.#done = true;
            response = response ? response : {};
            this.processed(response);

            this.#promise.resolve();
        }

        const process = () => this.#update(request)
            .then(done)
            .catch(exc => {
                console.log(exc.stack);
                done({errors: [`Exception caught: ${exc.message}`]})
            });
        process();

        return await this.#promise;
    }
}
