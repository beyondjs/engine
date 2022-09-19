module.exports = class extends global.ProcessorCode {
    get dp() {
        return 'svelte.code.css';
    }

    _build(hmr, diagnostics) {
        void (hmr);
        void (diagnostics);

        const sourcemap = new global.SourceMap();

        this.compiler.files.forEach(compiled => {
            if (!compiled.css) return;
            sourcemap.concat(compiled.css, compiled.url, compiled.cssMap);
        });
        return {code: sourcemap};
    }
}
