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

    async _preprocess(request) {
        const {processors} = this.targetedExport;

        const promises = [];
        processors.forEach(({dependencies, exports, types}) => {
            if (!types) return;

            dependencies && promises.push(dependencies.ready);
            exports && promises.push(exports.ready);
            types && promises.push(types.outputs.ready);
        });
        await Promise.all(promises);
        if (this.cancelled(request)) return;

        /**
         * The output to be used as the data input of the _build method
         */
        const output = {ims: [], dependencies: [], exports: []};
        processors.forEach(({dependencies, exports, types}) => {
            if (!types) return;

            types.outputs.ims?.forEach(im => output.ims.push(im));
            dependencies.forEach(dependency => output.dependencies.push(dependency));
            exports.forEach(_export => output.exports.push(_export));
        });
        return {...output};
    }

    async _build() {
        let count = 0;
        this.targetedExport.processors.forEach(({types}) => types?.outputs.ims?.size !== void 0 && count++);
        if (!count) return;

        const diagnostics = new BundleDiagnostics('types', this.targetedExport.processors);
        if (!diagnostics.valid) return {diagnostics};

        const {ims, dependencies, exports} = this.preprocessor.data;
        const {code, map} = await buildTypes({ims, dependencies, exports});
        return {code, map, diagnostics};
    }
}
