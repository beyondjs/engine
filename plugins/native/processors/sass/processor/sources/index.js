const {ProcessorSources} = require('beyond/plugins/helpers');

module.exports = class extends ProcessorSources {
    get template() {
        const {processor} = this;
        if (processor.specs.bundle.type === 'template/application') return;

        const {application, cspecs} = processor.specs;
        return application.template.application.processors.get(cspecs);
    }
}
