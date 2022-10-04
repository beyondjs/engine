const {ProcessorCompilerChildren} = require('beyond/bundler-helpers');

module.exports = class extends ProcessorCompilerChildren {
    dispose() {
        const {processor} = this.compiler.packager;
        const {dependencies} = processor;

        const children = new Map([['dependencies.declarations', {child: dependencies.declarations}]]);
        super.dispose(children);
    }
}
