const {ProcessorCode} = require('beyond/plugins/sdk');

module.exports = class extends ProcessorCode {
    get resource() {
        return 'js';
    }

    _generate() {
        return {script: `console.log('The "ts" processor!');`}
    }
}
