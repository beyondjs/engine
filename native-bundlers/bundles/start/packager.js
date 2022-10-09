const {TransversalPackager} = require('beyond/bundler-helpers');
const {bundles} = require('beyond/bundlers-registry');

module.exports = class extends TransversalPackager {
    constructor(...params) {
        super(...params);

        const {dependencies, application, cspecs} = this;
        if (application.engine === 'legacy') {
            dependencies.add('@beyond-js/kernel/core');
            dependencies.add('@beyond-js/kernel/routing');
        }

        for (let bundle of bundles.values()) {
            if (!bundle.start?.Start) continue;
            if (typeof bundle.start.Start.dependencies !== 'function') continue;

            bundle.start.Start.dependencies(cspecs).forEach(dependency => dependencies.add(dependency));
        }
    }
}
