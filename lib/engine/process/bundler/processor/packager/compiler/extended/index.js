const DynamicProcessor = global.utils.DynamicProcessor(Map);
const ExtendedCompilers = (require('./compilers'));

/**
 * The compiled files from the compilers of the processors being extended
 */
module.exports = class extends DynamicProcessor {
    get dp() {
        return 'processor.packager.compiler.extended';
    }

    #errors = [];
    get errors() {
        return this.#errors;
    }

    get valid() {
        return !this.#errors.length;
    }

    #processor;
    get processor() {
        return this.#processor;
    }

    get id() {
        return this.#processor.id;
    }

    // Check if the extended processors are updated
    // Ex: ts and sass are extended by svelte, this verification avoids processing
    // the compilation if after a change in a svelte source, the ts and sass compilers did not process with
    // the svelte extensions
    // One (ts or sass) compiler processes first, change notification is sent, and then the second compiler processes
    get synchronized() {
        const compilers = this.children.get('extended.compilers').child;
        return [...compilers.values()].reduce((prev, curr) => prev && curr.synchronized, true);
    }

    constructor(processor) {
        super();
        this.#processor = processor;

        const {meta} = this.#processor;
        const {bundle} = processor.specs;
        if (bundle.type.startsWith('template/')) return;

        const {extends: _extends} = meta.extender;
        _extends.forEach(processor => this.set(processor, new Map()));

        // The extensions of the current processor being extended by other processors of the same bundle
        const extendedCompilers = new ExtendedCompilers(processor);
        super.setup(new Map([['extended.compilers', {child: extendedCompilers}]]));
    }

    _prepared(require) {
        const compilers = this.children.get('extended.compilers').child;
        compilers.forEach(compiler => require(compiler));
    }

    _process() {
        const compilers = this.children.get('extended.compilers').child;

        this.forEach(extended => extended.clear());

        // Find errors in the compilers
        const errors = this.#errors;
        errors.length = 0;
        for (const [name, compiler] of compilers) {
            if (compiler.valid) continue;
            errors.push(`Compiler "${name}" has reported errors`);
        }

        if (!this.valid) return;

        // Iterate through the source files of the processor and look for the compiled files
        // from the extended compilers
        compilers.size && this.#processor.sources.files.forEach((source, file) => {
            compilers.forEach(compiler => {
                if (!compiler.extensions.has(file)) return;

                const {processor} = compiler.packager;
                const extended = this.get(processor.name);
                const compiled = compiler.extensions.get(file);
                extended.set(file, compiled);
            });
        });
    }
}
