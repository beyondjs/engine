const {ConditionalCode} = require('beyond/plugins/sdk');
const build = require('./build');

module.exports = class extends ConditionalCode {
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
        const {pexport, processors} = this.conditional;
        require(pexport.specifier);
        processors.forEach(({js}) => js && require(js));
    }

    async _preprocess() {
        const {processors} = this.conditional;

        // const {plugin} = this;
        // console.log('plugin test configuration:', plugin.properties.subpath, this.config);
        const promises = [];
        processors.forEach(({js: {outputs, dependencies, exports}}) => {
            dependencies && promises.push(dependencies.ready);
            exports && promises.push(exports.ready);
            promises.push(outputs.ready);
        });
        await Promise.all(promises);
    }

    async _build(local) {
        return await build(this.conditional, local);
    }
}
