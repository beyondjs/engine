const {Processor} = require('beyond/plugins/sdk');

module.exports = class extends Processor {
    static get name() {
        return 'test';
    }
}
