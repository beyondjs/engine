const {Code} = require('beyond/plugins/sdk');

module.exports = class extends Code {
    constructor(conditional) {
        super(conditional, {cache: true});

        const {processors} = conditional;
        super.setup(new Map([['processors', {child: processors}]]));
    }

    get resource() {
        return 'js';
    }

    get hash() {
        return 0;
    }

    _generate() {
        // const {plugin} = this;
        // console.log('plugin test configuration:', plugin.properties.subpath, this.config);
        return {code: 'console.log("bundle js - hello world");'};
    }
}
