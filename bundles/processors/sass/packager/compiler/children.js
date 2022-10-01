module.exports = class extends global.ProcessorCompilerChildren {
    dispose() {
        const {dependencies} = this.compiler.packager.processor;
        super.dispose(new Map([['dependencies.files', {child: dependencies.files}]]));
    }
}
