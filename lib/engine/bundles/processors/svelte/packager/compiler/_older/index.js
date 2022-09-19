const svelte = require('svelte/compiler');
const CompiledSource = require('./source');

module.exports = class extends global.ProcessorsExtenderSinglyCompiler {
    async _compileSource(source, extended, request) {
        const preprocessed = await svelte.preprocess(source.content, {
            script: () => {
                if (!extended.get('ts').has(source.relative.file)) {
                    throw new Error(`Compiled .ts file "${source.relative.file}" not found`);
                }

                const compiled = extended.get('ts').get(source.relative.file);
                if (!compiled) {
                    throw new Error(`Compiled .ts file "${source.relative.file}" is undefined`);
                }

                const {code, map, dependencies} = compiled;
                return {code, map, dependencies: [...dependencies.keys()]};
            },
            style: () => {
                if (!extended.get('sass').has(source.relative.file)) {
                    throw new Error(`Compiled .sass file "${source.relative.file}" not found`);
                }

                const compiled = extended.get('sass').get(source.relative.file);
                if (!compiled) {
                    throw new Error(`Compiled .sass file "${source.relative.file}" is undefined`);
                }

                const {code, map} = compiled;
                return {code, map};
            }
        }, {
            filename: source.file
        });

        if (this._request !== request) return;

        let css, js;
        try {
            const {distribution} = this.processor;
            const generate = distribution.platform === 'ssr' ? 'ssr' : 'dom';
            const hydratable = distribution.platform === 'web.ssr';
            ({css, js} = svelte.compile(preprocessed.code, {css: false, generate, hydratable}));
        }
        catch (exc) {
            console.log(exc.message);
            return {errors: [exc.message]};
        }

        const compiled = new Map();
        js.code && compiled.set('ts', new CompiledSource(this.processor, 'extension', source, {
            code: js.code,
            map: js.map
        }));
        css.code && compiled.set('sass', new CompiledSource(this.processor, 'extension', source, {
            code: css.code,
            map: css.map
        }));

        return {compiled};
    }
}
