const DynamicProcessor = global.utils.DynamicProcessor(Map);
const ProcessorsExtensionsHashes = (require('./processors'));

/**
 * The files collected from the extensions of the current processor
 */
module.exports = class extends DynamicProcessor {
    get dp() {
        return 'processor.sources.extensions';
    }

    #processor;
    get processor() {
        return this.#processor;
    }

    #hashes;
    get hashes() {
        return this.#hashes;
    }

    #errors = [];
    get errors() {
        return this.#errors;
    }

    get valid() {
        return !this.errors.length;
    }

    #template;

    constructor(processor) {
        super();
        this.#processor = processor;
        this.#hashes = new (require('./hashes'))(this);

        const {bundle} = processor.specs;
        this.#template = bundle.type.startsWith('template/');
        if (this.#template) return;

        // The extensions of the current processor being extended by other processors of the same bundle
        // The extensions hashes are used since these, in turn, have the extensions as children
        const hashes = new ProcessorsExtensionsHashes(processor);
        super.setup(new Map([['extensions.hashes', {child: hashes}]]));
    }

    _prepared(require) {
        if (this.#template) return;
        const exthashes = this.children.get('extensions.hashes').child;
        exthashes.forEach(exthash => require(exthash));
    }

    _process() {
        if (this.#template) return;
        const exthashes = this.children.get('extensions.hashes').child;
        this.clear();

        const errors = this.#errors = [];
        exthashes.forEach(exthash => {
            const {extension} = exthash;
            extension.valid ? extension.files.forEach(source => this.set(source.relative.file, source)) :
                errors.push(`Extension "${extension.processor.name}" has been preprocessed with errors`);
        });
    }
}
