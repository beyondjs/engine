const DynamicProcessor = require('beyond/utils/dynamic-processor');

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
        files.forEach(file => file.exports.forEach(e => this.push(e)));
    }
}
