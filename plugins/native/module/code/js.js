const {Code} = require('beyond/plugins/sdk');

module.exports = class extends Code {
    constructor(conditional) {
        super(conditional, {cache: true});

        const processors = conditional.processorsSets.get();
        super.setup(new Map([['processors', {child: processors}]]));
    }

    get resource() {
        return 'js';
    }

    _generate() {
        // const {plugin} = this;
        // console.log('plugin test configuration:', plugin.properties.subpath, this.config);
        return {code: 'console.log("bundle js - hello world");'};
    }
}
