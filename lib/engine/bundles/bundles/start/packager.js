module.exports = class extends global.TransversalPackager {
    constructor(...params) {
        super(...params);

        const {dependencies, application, distribution} = this;
        if (application.engine === 'legacy') {
            dependencies.add('@beyond-js/kernel/core');
            dependencies.add('@beyond-js/kernel/routing');
        }

        for (let bundle of global.bundles.values()) {
            if (!bundle.start?.Start) continue;
            if (typeof bundle.start.Start.dependencies !== 'function') continue;

            bundle.start.Start.dependencies(distribution).forEach(dependency => dependencies.add(dependency));
        }
    }
}
