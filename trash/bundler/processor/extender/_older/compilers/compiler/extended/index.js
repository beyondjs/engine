const DynamicProcessor = global.utils.DynamicProcessor(Map);
const ExtendedCompilers = (require('./compilers'));

/**
 * The compiled files from the compilers of the processors being extended
 */
module.exports = class extends DynamicProcessor {
    get dp() {
        return 'processor.extender.compiler.extended';
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

    constructor(processor) {
        super();
        this.#processor = processor;

        const {bundle} = processor.specs;
        if (bundle.type.startsWith('template/')) return;

        const {meta} = this.#processor;
        const {extends: _extends} = meta.extender;
        _extends.forEach(processor => this.set(processor, new Map()));

        // The extensions of the current processor being extended by other processors of the same bundle
        const events = ['compiler.initialised', 'compiler.change'];
        super.setup(new Map([['extended.compilers', {child: new ExtendedCompilers(processor), events}]]));
    }

    _prepared(check) {
        const compilers = this.children.get('extended.compilers').child;
        compilers.forEach(compiler => check(compiler));
    }

    _process() {
        const compilers = this.children.get('extended.compilers').child;

        const {meta} = this.#processor;
        const {extends: _extends} = meta.extender;

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
        this.#processor.sources.files.forEach((source, file) => {
            compilers.forEach(compiler => {
                const {processor} = compiler.packager;
                if (!_extends.includes(processor.name)) return;

                const extended = this.get(processor.name);
                const compiled = compiler.extensions.get(file);
                extended.set(file, compiled);
            });
        });
    }
}
