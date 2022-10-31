const {Code} = require('beyond/plugins/sdk');

module.exports = class extends Code {
    constructor(conditional) {
        super(conditional, {cache: true});
    }

    get resource() {
        return 'js';
    }

    _generate() {
        const {plugin} = this;
        console.log('plugin test configuration:', plugin.properties.subpath, this.config);
        return {code: 'console.log("hello world");'};
    }
}
