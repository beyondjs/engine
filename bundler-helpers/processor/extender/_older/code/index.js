const DynamicProcessor = global.utils.DynamicProcessor(Map);

module.exports = class extends DynamicProcessor {
    get dp() {
        return 'processor.extender.extension.code';
    }

    #extending;
    get extending() {
        return this.#extending;
    }

    /**
     * Processor extension sources constructor
     *
     * @param extending {string} The name of the processor that is being extended
     * @param compiler {object} The compiler of the processor that extends other processors
     */
    constructor(extending, compiler) {
        super();
        this.#extending = extending;

        super.setup(new Map([['compiler', {child: compiler}]]));
    }

    _process() {
        this.clear();

        const compiler = this.children.get('compiler').child;
        const files = compiler.get(this.#extending);
        files.forEach((compiled, key) => this.set(key, compiled));
    }
}
