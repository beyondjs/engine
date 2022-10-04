const {ProcessorCode, SourceMap} = require('beyond/bundler-helpers');

module.exports = class extends ProcessorCode {
    get dp() {
        return 'sass.code.css';
    }

    // The code of the processor and its HMR is the same
    #sourcemap;

    _process(request) {
        this.#sourcemap = undefined;
        super._process(request);
    }

    _build(hmr, diagnostics) {
        void (hmr);
        void (diagnostics);

        if (this.#sourcemap !== void 0) return {sourcemap: this.#sourcemap};
        const sourcemap = this.#sourcemap = new SourceMap();

        this.compiler.files.forEach(({code, url, map}) => sourcemap.concat(code, url, map));
        return {code: sourcemap};
    }
}
