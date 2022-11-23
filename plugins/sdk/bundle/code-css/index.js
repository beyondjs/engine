const TargetedExportResource = require('../../targeted-export/targeted-export-resource/plugins');
const BundleDiagnostics = require('../diagnostics/diagnostics');
const buildCSS = require('./build');

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
        processors.forEach(({css}) => css && promises.push(css.outputs.ready));
        await Promise.all(promises);
    }

    async _build() {
        let count = 0;
        this.targetedExport.processors.forEach(({css}) => css?.outputs.styles !== void 0 && count++);
        if (!count) return;

        const diagnostics = new BundleDiagnostics('css', this.targetedExport.processors);
        if (!diagnostics.valid) return {diagnostics};

        const {code, map} = await buildCSS(this.targetedExport);
        return {code, map, diagnostics};
    }
}
