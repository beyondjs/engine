module.exports = class extends require('../base') {
    get dp() {
        return 'bundler.bundle.packager.code.css';
    }

    constructor(packager) {
        super('.css', packager);
    }

    // Actually, the code of the css bundle and its hmr is the same, so avoid to duplicate
    // the processing of the bundle when it is hmr required
    #sourcemap;

    _update() {
        let sourcemap = new global.SourceMap();
        const {processors, distribution} = this.packager;

        // Process the code of each processor
        processors.forEach(processor => {
            const {packager} = processor;
            if (!packager || !packager.css) return;

            let {code} = packager.css;
            if (!code) return;

            code = typeof code === 'string' ? {code} : code;
            if (!code.code) return;

            sourcemap.concat(code.code, void 0, code.map);
            sourcemap.concat('\n');
        });

        let errors, warnings;
        ({sourcemap, errors, warnings} = (() => {
            if (!distribution.minify?.css) return {sourcemap};

            const {code, map} = sourcemap;
            const cleaned = new (require('clean-css'))({sourceMap: true, target: '/'}).minify(code, map);
            const {errors, warnings} = cleaned;

            if (errors.length) return {errors, warnings};
            let {styles, sourceMap} = cleaned;

            sourcemap = {code: styles, map: JSON.parse(sourceMap.toString())};
            return {sourcemap, warnings};
        })());

        sourcemap.map.sourceRoot = distribution.platform === 'web' ? '/' : `${process.cwd()}/`;

        this.#sourcemap = sourcemap;
        return {sourcemap, errors, warnings};
    }

    _process() {
        !super.updated && (this.#sourcemap = void 0);
        super._process();
    }
}
