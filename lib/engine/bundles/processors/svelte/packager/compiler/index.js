const svelte = require('svelte/compiler');

module.exports = class extends global.ProcessorSinglyCompiler {
    get dp() {
        return 'svelte.compiler';
    }

    async _compileSource(source, is, request) {
        const {extended} = this;
        const processor = this.packager;
        const {distribution} = processor;

        let preprocessed;
        try {
            preprocessed = await svelte.preprocess(source.content, {
                script: () => {
                    if (!extended.get('ts').has(source.relative.file)) {
                        throw new Error(`Compiled .ts file "${source.relative.file}" not found`);
                    }

                    const compiled = extended.get('ts').get(source.relative.file);
                    if (!compiled) {
                        throw new Error(`Compiled .ts file "${source.relative.file}" is undefined`);
                    }

                    let {code, map, dependencies} = compiled;
                    code = code.replace('export default Component;', '// export default Component;');
                    return {code, map, dependencies: [...dependencies.keys()]};
                },
                style: () => {
                    if (!extended.get('sass').has(source.relative.file)) return;
                    const compiled = extended.get('sass').get(source.relative.file);
                    if (!compiled) return;

                    let {code, map} = compiled;

                    // The svelte preprocessor modifies the map object, avoid to change the map of the
                    // original extended object
                    map = Object.assign({}, map);
                    map.mappings instanceof Array && (map.mappings = map.mappings.slice());

                    return {code, map};
                }
            }, {
                filename: source.file
            });
        }
        catch (exc) {
            console.log(exc.stack);
            return {errors: [exc.message]};
        }
        if (this._request !== request) return;

        let css, js;
        try {
            const generate = distribution.platform === 'ssr' ? 'ssr' : 'dom';
            const hydratable = distribution.platform === 'web' && !!distribution.ssr;
            ({css, js} = svelte.compile(preprocessed.code, {css: false, generate, hydratable}));
        }
        catch (exc) {
            console.log(exc.message);
            return {errors: [exc.message]};
        }

        if (!js.code) return;

        const compiled = new this.CompiledSource(processor, distribution, is, source, {
            code: js.code,
            map: js.map,
            css: css.code,
            cssMap: css.map
        });
        return {compiled};
    }
}
