const {Code} = require('beyond/plugins/sdk');

module.exports = class extends Code {
    constructor(conditional) {
        super(conditional, {preprocessor: true, cache: true});

        const {processors} = conditional;
        super.setup(new Map([['processors', {child: processors}]]));
    }

    get resource() {
        return 'js';
    }

    get hash() {
        return 0;
    }

    _prepared(require) {
        const {processors} = this.conditional;
        processors.forEach(({js}) => js && require(js));
    }

    async _preprocess() {
        const {processors} = this.conditional;

        // const {plugin} = this;
        // console.log('plugin test configuration:', plugin.properties.subpath, this.config);
        const promises = [];
        processors.forEach(({js}) => promises.push(js.outputs.ready));
        await Promise.all(promises);
    }

    _build(hmr) {
        const {processors} = this.conditional;

        let code = '';
        processors.forEach(({js}, name) => code += js.outputs.script.code + '\n\n');

        return {code};
    }
}
