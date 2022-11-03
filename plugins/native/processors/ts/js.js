const {ProcessorCode} = require('beyond/plugins/sdk');

module.exports = class extends ProcessorCode {
    get resource() {
        return 'js';
    }

    get hash() {
        return this.processor.hash;
    }

    _generate() {
        return {script: `console.log('The "ts" processor!');`}
    }
}
