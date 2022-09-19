module.exports = class extends global.ProcessorHashes {
    get dp() {
        return 'css.processor.hashes';
    }

    constructor(processor) {
        super(processor);

        const {functions} = processor.sources;
        functions && super.setup(new Map([['functions.hash', {child: functions.hash}]]));
    }

    _compute() {
        const functions = this.children.get('functions.hash')?.child;
        return functions ? functions.value : 0;
    }
}
