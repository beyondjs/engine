const DynamicProcessor = require('beyond/utils/dynamic-processor');

module.exports = class extends DynamicProcessor() {
    #update;
    #processed;

    constructor(updated, processed) {
        super();

        this.#update = update;
        this.#processed = processed;
    }

    async _process(request) {
        this.#code = this.#map = void 0;

        const done = response => {
            if (this._request !== request) return;

            response = response ? response : {};
            this.#processed(response);
        }

        const process = () => this.#update(request)
            .then(done)
            .catch(exc => {
                console.log(exc.stack);
                done({errors: [`Exception caught: ${exc.message}`]})
            });
        process();
    }
}
