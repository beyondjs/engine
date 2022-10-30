const PendingPromise = require('../pending-promise');

module.exports = class {
    #process;
    #done;

    /**
     * Reprocessor constructor
     * @param process {function: Promise<void>} The async process function to be re-executed on invalidation
     * @param done {function} Called after process is completed
     */
    constructor(process, done) {
        this.#process = process;
        this.#done = done;
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
            this.#done(response);

            this.#promise.resolve();
        }

        const process = () => {
            request = this.#request = Date.now();

            this.#process(request)
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
