const Diagnostics = require('../../../diagnostics/diagnostics');
const BundleDiagnostic = require('../diagnostic');

module.exports = class extends Diagnostics {
    constructor(resource, processors) {
        super();
        processors.forEach(processor => {
            if (!processor[resource]) return;

            const {diagnostics} = processor[resource].outputs;
            diagnostics.forEach(processorDiagnostic => {
                const bundleDiagnostic = new BundleDiagnostic(processor.name, processorDiagnostic);
                this.push(bundleDiagnostic);
            });
        });
    }
}
