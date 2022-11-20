const {ProcessorHashes} = require('beyond/plugins/helpers');

module.exports = class extends ProcessorHashes {
    get dp() {
        return 'sass.processor.hashes';
    }

    constructor(processor) {
        super(processor);

        const {hash} = processor.dependencies.files;
        super.setup(new Map([['dependencies.files.hash', {child: hash}]]));
    }

    _compute() {
        return this.children.get('dependencies.files.hash').child.value;
    }
}
