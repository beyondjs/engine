const DynamicProcessor = require('beyond/utils/dynamic-processor');

module.exports = class extends DynamicProcessor() {
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
        files.forEach(file => {
            const {name, line, character} = file.exports.get('message');
            console.log(name, line, character);
        });
    }
}
