const {Code} = require('beyond/plugins/sdk');

module.exports = class extends Code {
    constructor(conditional) {
        super(conditional, {cache: true});
    }

    get resource() {
        return 'js';
    }

    /**
     * Because the generated code is always the same, the hash also always stays the same
     * @return {number}
     */
    get hash() {
        return 0;
    }

    _build() {
        const {plugin} = this;
        console.log('plugin test configuration:', plugin.properties.subpath, this.config);
        return {code: 'console.log("hello world");'};
    }
}
