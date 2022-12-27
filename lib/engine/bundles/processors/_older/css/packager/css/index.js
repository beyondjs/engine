module.exports = class extends global.ProcessorCode {
    get dp() {
        return 'css.code';
    }

    #lines;
    get lines() {
        return this.#lines;
    }

    // The code of the processor and its HMR is the same
    #code;

    _process(request) {
        this.#code = this.#lines = undefined;
        super._process(request);
    }

    _build(hmr, diagnostics) {
        void (hmr); // No matter if it is hmr or not, the code is just the same

        if (this.#code !== void 0) return {code: this.#code};

        const {compiler} = this;

        let code = this.#code = '';

        const {specs} = this.packager.processor;
        if (!specs.bundle.type.startsWith('template/')) return;

        const done = ({errors, warnings, code, lines}) => {
            warnings?.forEach(warning => diagnostics.warnings.push(warning));
            errors?.forEach(error => diagnostics.general.push(error));
            this.#code = code;
            this.#lines = lines;
            return {code};
        }

        code = compiler.code;
        const lines = !code ? 0 : (code.length - code.replace(/\n/g, '').length + 1);
        return done({code, lines});
    }
}
