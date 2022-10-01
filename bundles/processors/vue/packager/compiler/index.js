const vue = require('vue/compiler-sfc');

module.exports = class extends global.ProcessorSinglyCompiler {
    #CompiledSource = require('./source');
    get CompiledSource() {
        return this.#CompiledSource;
    }

    _compileSource(source, is) {
        const {extended} = this;
        const processor = this.packager;

        const filename = source.url;
        const scopeId = source.relative.file
            .slice(0, source.relative.file.length - 4) // remove .vue extension
            .replace(/\//g, '__');

        let css;
        try {
            if (extended.get('sass').has(source.relative.file)) {
                const preprocessed = extended.get('sass').get(source.relative.file);
                const {content, scoped, map: inMap} = preprocessed;
                css = vue.compileStyle({id: scopeId, filename, scoped, source: content, inMap});
                if (css.errors?.length) return {errors: css.errors};
            }
        }
        catch (exc) {
            return {errors: [`Error compiling style: ${exc.message}`]};
        }

        let descriptor;
        try {
            const options = {sourceMap: source.map, filename};
            let errors;
            ({descriptor, errors} = vue.parse(source.content, options));
            if (errors?.length) return {errors: ['Error parsing component']};
        }
        catch (exc) {
            return {errors: [`Error parsing component: ${exc.message}`]};
        }

        let template;
        try {
            template = vue.compileTemplate({source: descriptor.template.content, filename, id: scopeId});
        }
        catch (exc) {
            return {errors: [`Error parsing component: ${exc.message}`]};
        }

        const script = extended.get('ts').has(source.relative.file) ?
            extended.get('ts').get(source.relative.file) : void 0;

        const {distribution} = this.packager;
        const compiled = new this.#CompiledSource(processor, distribution, is, source, {
            scopeId,
            code: script.code, map: script.map,
            css: css?.code, cssMap: css?.map,
            template: template.code, templateMap: template.map
        });

        return {compiled};
    }
}
