const {Code} = require('beyond/plugins/sdk');

module.exports = class extends Code {
    constructor(conditional) {
        super(conditional, {cache: true});
    }

    _outputs() {
        return {code: 'console.log("hello world");'};
    }
}
