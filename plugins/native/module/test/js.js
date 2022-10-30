const {Code} = require('beyond/plugins/sdk');

module.exports = class extends Code {
    constructor(conditional) {
        super(conditional, {cache: true});
    }

    get resource() {
        return 'js';
    }

    _generate() {
        return {code: 'console.log("hello world");'};
    }
}
