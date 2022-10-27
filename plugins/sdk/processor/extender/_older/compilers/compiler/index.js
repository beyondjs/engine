const DynamicProcessor = global.utils.DynamicProcessor(Map);

module.exports = class extends DynamicProcessor {
    get dp() {
        return 'processor.extender.compiler';
    }

    #processor;
    get processor() {
        return this.#processor;
    }

    #distribution;
    get distribution() {
        return this.#distribution;
    }

    get extendedCompilers() {
        return this.children.get('extended.compilers').child;
    }

    #diagnostics;
    get diagnostics() {
        return this.#diagnostics;
    }

    get valid() {
        return this.#diagnostics.valid;
    }

    /**
     * Processors extender constructor
     *
     * @param processor {object} The processor object
     * @param distribution {object} The distribution specification
     */
    constructor(processor, distribution) {
        super();
        this.#processor = processor;
        this.#distribution = distribution;

        const {meta} = this.#processor;
        const {extends: _extends} = meta.extender;
        _extends.forEach(processor => this.set(processor, new Map()));

        const children = [['extended.compilers', {child: new (require('./extended'))(processor)}]];
        super.setup(new Map(children));
    }

    async _compile(updated, diagnostics, request) {
        void (updated);
        void (diagnostics);
        void (request);
    }

    async _process(request) {
        const diagnostics = new (require('./diagnostics'))();
        const updated = new Map();
        [...this.keys()].forEach(processor => updated.set(processor, new Map()));

        const done = () => {
            this.#diagnostics = diagnostics;

            // Copy the compiled files of the extended processors
            this.forEach((files, extended) => {
                files.clear();
                if (!updated.has(extended)) return;
                updated.get(extended).forEach((value, key) => files.set(key, value));
            });
        }

        if (!this.extendedCompilers.valid) {
            diagnostics.set({general: this.extendedCompilers.errors});
            done();
            return;
        }

        await this._compile(updated, diagnostics, request);
        if (this._request !== request) return;

        done();
    }
}
