const {ProcessorSources} = require('beyond/bundler-helpers');

module.exports = class extends ProcessorSources {
    get template() {
        const {processor} = this;
        if (processor.specs.bundle.type === 'template/application') return;

        const {application, distribution} = processor.specs;
        return application.template.application.processors.get(distribution);
    }
}
