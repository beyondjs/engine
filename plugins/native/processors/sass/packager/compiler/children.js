const {ProcessorCompilerChildren} = require('beyond/plugins/helpers');

module.exports = class extends ProcessorCompilerChildren {
    dispose() {
        const {dependencies} = this.compiler.packager.processor;
        super.dispose(new Map([['dependencies.files', {child: dependencies.files}]]));
    }
}
