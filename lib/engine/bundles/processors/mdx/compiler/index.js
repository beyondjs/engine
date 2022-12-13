const { SourceMapGenerator } = require("source-map");

module.exports = class extends global.ProcessorSinglyCompiler {
    get dp() {
        return "mdx.compiler";
    }

    async _compileSource(source) {
        const { processor, distribution } = this.packager;

        try {
            const { compile } = await import("@mdx-js/mdx");
            const compiled = await compile(
                { path: source.relative.file, value: source.content },
                { SourceMapGenerator }
            );
            const { map, value: code } = compiled;
            const resource = new this.CompiledSource(processor, distribution, source.is, source, { code, map });

            return { compiled: resource };
        } catch (exc) {
            const errors = [{ message: exc.message }];
            console.error(errors);
            return { errors };
        }
    }
};
