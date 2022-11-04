const {ProcessorCompiler} = require('beyond/plugins/sdk');
const Outputs = require('./outputs');
const Output = require('./output');
const transpile = require('./transpile');

module.exports = class extends ProcessorCompiler {
    get hash() {
        return this.processor.hash;
    }

    async _compile(request) {
        const {files, tsconfig} = this.processor.sources;
        await files.ready;
        if (this.cancelled(request)) return;

        const promises = [];
        files.forEach(file => promises.push(file.ready));
        promises.push(tsconfig.ready);
        await Promise.all(promises);
        if (this.cancelled(request)) return;
console.log('tsconfig:', tsconfig.content);
        const outputs = new Outputs();
        for (const file of files.values()) {
            const {code, map, diagnostics} = transpile(file, tsconfig);
            const output = new Output(file, code, map, diagnostics);
            outputs.set(file.file, output);
        }
        return outputs;
    }
}
