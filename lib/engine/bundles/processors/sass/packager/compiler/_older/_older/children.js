module.exports = class extends global.ProcessorCompilerChildren {
    dispose(check) {
        const {processor} = this.compiler.packager;
        const {dependencies} = processor;

//        const children = new Map([['dependencies', {child: dependencies.declarations}]]);
        const children = new Map();
        super.dispose(check, children);
    }
}
