const compiler = require('vue-template-compiler');

module.exports = class extends global.ProcessorSinglyCompiler {
    get dp() {
        return 'html-vue.compiler';
    }

    #CompiledSource = require('./source');
    get CompiledSource() {
        return this.#CompiledSource;
    }

    _compileSource(source) {
        const {processor} = this.packager;
        const ssr = processor.distribution.platform === 'ssr';

        try {
            const method = ssr ? 'ssrCompile' : 'compile';
            const {render, staticRenderFns, errors} = compiler[method](source.content);
            if (errors?.length) return {errors};

            const compiled = new this.#CompiledSource(processor, 'source', source, {render, staticRenderFns});
            return {compiled};
        }
        catch (exc) {
            return {errors: [{message: exc.message}]};
        }
    }
}
