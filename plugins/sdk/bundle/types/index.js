const {ConditionalCode} = require('beyond/plugins/sdk');
const build = require('./build');

module.exports = class extends ConditionalCode {
    constructor(conditional) {
        super(conditional, {preprocessor: true, cache: true});

        const {processors} = conditional;
        super.setup(new Map([['processors', {child: processors}]]));
    }

    get resource() {
        return 'types';
    }

    get hash() {
        return 0;
    }

    _prepared(require) {
        const {pexport, processors} = this.conditional;
        require(pexport.specifier);
        processors.forEach(({types}) => types && require(types));
    }

    async _preprocess() {
        const {processors} = this.conditional;

        const promises = [];
        processors.forEach(({js, types}) => {
            const {dependencies, exports} = js;

            dependencies && promises.push(dependencies.ready);
            exports && promises.push(exports.ready);
            types && promises.push(types.outputs.ready);
        });
        await Promise.all(promises);
    }

    async _build(local) {
        return {code: 'The typescript declaration'};
        return await build(this.conditional, local);
    }
}
