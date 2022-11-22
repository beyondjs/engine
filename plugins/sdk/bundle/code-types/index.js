const TargetedExportResource = require('../../targeted-export/targeted-export-resource/plugins');
const BundleDiagnostics = require('../diagnostics/diagnostics');
const buildTypes = require('./build');

module.exports = class extends TargetedExportResource {
    constructor(targetedExport) {
        super(targetedExport, {preprocessor: true, cache: true});

        const {processors} = targetedExport;
        super.setup(new Map([['processors', {child: processors}]]));
    }

    get resource() {
        return 'types';
    }

    get hash() {
        return 0;
    }

    _prepared(require) {
        const {packageExport, processors} = this.targetedExport;
        require(packageExport.specifier);
        processors.forEach(({types}) => types && require(types));
    }

    async _preprocess() {
        const {processors} = this.targetedExport;

        const promises = [];
        processors.forEach(({js, types}) => {
            if (!types) return;
            const {dependencies, exports} = js;

            dependencies && promises.push(dependencies.ready);
            exports && promises.push(exports.ready);
            types && promises.push(types.outputs.ready);
        });
        await Promise.all(promises);
    }

    async _build() {
        const diagnostics = new BundleDiagnostics('types', this.targetedExport.processors);
        if (!diagnostics.valid) return {diagnostics};

        return {code: 'The typescript declaration', diagnostics};

        const {code, map} = await buildTypes(this.targetedExport);
        return {code, map, diagnostics};
    }
}
