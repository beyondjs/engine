const {TargetedExportResource} = require('beyond/plugins/sdk');
const build = require('./build');

module.exports = class extends TargetedExportResource {
    constructor(targetedExport) {
        super(targetedExport, {preprocessor: true, cache: true});

        const {processors} = targetedExport;
        super.setup(new Map([['processors', {child: processors}]]));
    }

    get resource() {
        return 'css';
    }

    get hash() {
        return 0;
    }

    _prepared(require) {
        const {packageExport, processors} = this.targetedExport;
        require(packageExport.specifier);
        processors.forEach(({css}) => css && require(css));
    }

    async _preprocess() {
        const {processors} = this.targetedExport;

        const promises = [];
        processors.forEach(({css: {outputs}}) => promises.push(outputs.ready));
        await Promise.all(promises);
    }

    async _build() {
        return await build(this.targetedExport);
    }
}
