const DynamicProcessor = require('beyond/utils/dynamic-processor');

module.exports = class extends DynamicProcessor() {
    get dp() {
        return 'jsx.dependencies.hashes';
    }

    // The dependencies of the jsx processor never change
    get sources() {
        return 0;
    }
}
