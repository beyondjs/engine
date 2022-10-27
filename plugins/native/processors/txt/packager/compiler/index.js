const {ProcessorSinglyCompiler} = require('beyond/plugins/helpers');

module.exports = class extends ProcessorSinglyCompiler {
    get dp() {
        return 'txt.compiler';
    }

    _compileSource(source) {
        const {processor, cspecs} = this.packager;

        try {
            const code = JSON.parse(source.content);
            const compiled = new this.CompiledSource(processor, cspecs, source.is, source, {code});
            return {compiled};
        }
        catch (exc) {
            const errors = [{message: exc.message}];
            return {errors};
        }
    }
}
