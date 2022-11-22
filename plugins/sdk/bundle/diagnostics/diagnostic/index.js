const Diagnostic = require('../../../diagnostics/diagnostic');

module.exports = class extends Diagnostic {
    #processorName;
    get processorName() {
        return this.#processorName;
    }

    constructor(processorName, values) {
        super(values);
        this.#processorName = processorName;
    }
}
