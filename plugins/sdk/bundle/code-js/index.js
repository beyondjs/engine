const TargetedExportResource = require('../../targeted-export/targeted-export-resource/plugins');
const BundleDiagnostics = require('../diagnostics/diagnostics');
const buildJS = require('./build');

module.exports = class extends TargetedExportResource {
    constructor(targetedExport) {
        super(targetedExport, {preprocessor: true, cache: true});

        const {processors} = targetedExport;
        super.setup(new Map([['processors', {child: processors}]]));
    }

    get resource() {
        return 'js';
    }

    get hash() {
        return 0;
    }

    _prepared(require) {
        const {packageExport, processors} = this.targetedExport;
        require(packageExport.specifier);
        processors.forEach(({js}) => js && require(js));
    }

    async _preprocess() {
        const {processors} = this.targetedExport;

        const promises = [];
        processors.forEach(({js}) => {
            if (!js) return;

            const {outputs, dependencies, exports} = js;
            dependencies && promises.push(dependencies.ready);
            exports && promises.push(exports.ready);
            promises.push(outputs.ready);
        });
        await Promise.all(promises);
    }

    async _build(local) {
        const diagnostics = new BundleDiagnostics('js', this.targetedExport.processors);
        if (!diagnostics.valid) return {diagnostics};

        const {code, map} = await buildJS(this.targetedExport, local);
        return {code, map, diagnostics};
    }
}
