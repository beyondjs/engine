const DynamicProcessor = require('beyond/utils/dynamic-processor');
const BundleExport = require('./bundle-export');

module.exports = class extends DynamicProcessor(Array) {
    get dp() {
        return 'ts-processor.dependencies';
    }

    #analyzer;

    constructor(analyzer) {
        super();
        this.#analyzer = analyzer;
    }

    _prepared(require) {
        require(this.#analyzer.files);
    }

    _process() {
        const {files} = this.#analyzer;
        this.length = 0;
        files.forEach(({source, exports}) => exports.forEach(sourceExport => {
            const bundleExport = new BundleExport(source, sourceExport);
            this.push(bundleExport);
        }));
    }
}
