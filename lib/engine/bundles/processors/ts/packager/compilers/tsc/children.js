module.exports = class extends global.ProcessorCompilerChildren {
    dispose() {
        const {processor} = this.compiler.packager;
        const {dependencies} = processor;

        const children = new Map([['dependencies.declarations', {child: dependencies.declarations}]]);
        super.dispose(children);
    }
}
