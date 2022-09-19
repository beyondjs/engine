module.exports = class extends global.ProcessorHashes {
    get dp() {
        return 'ts.processor.hashes';
    }

    constructor(processor) {
        super(processor);

        const {hash} = processor.dependencies.declarations;
        super.setup(new Map([['declarations.hash', {child: hash}]]));
    }

    _compute() {
        return this.children.get('declarations.hash').child.value;
    }
}
