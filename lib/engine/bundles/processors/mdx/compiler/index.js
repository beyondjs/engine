const { SourceMapGenerator } = require("source-map");

module.exports = class extends global.ProcessorSinglyCompiler {
    get dp() {
        return "mdx.compiler";
    }

    async _compileSource(source) {
        const { processor, distribution } = this.packager;

        const { compile } = await import("@mdx-js/mdx");

        try {
            // const mdxCompiled = await compile({ path: source.file, value: source.content }, { SourceMapGenerator });
            // const { code, map } = mdxCompiled;
            const code = source.code;
            const map = void 0;

            const compiled = new this.CompiledSource(processor, distribution, source.is, source, { code, map });
            return { compiled };
        } catch (exc) {
            const errors = [{ message: exc.message }];
            return { errors };
        }
    }
};
