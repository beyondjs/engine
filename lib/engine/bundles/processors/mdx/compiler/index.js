module.exports = class extends global.ProcessorSinglyCompiler {
    get dp() {
        return 'mdx.compiler';
    }

    _compileSource(source) {
        const {processor, distribution} = this.packager;

        try {
            const code = source.content;
            const map = void 0;

            const compiled = new this.CompiledSource(processor, distribution, source.is, source, {code, map});
            return {compiled};
        }
        catch (exc) {
            const errors = [{message: exc.message}];
            return {errors};
        }
    }
}
