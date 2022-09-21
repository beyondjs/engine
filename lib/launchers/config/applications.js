const DynamicProcessor = global.utils.DynamicProcessor(Set);
const {crc32, equal} = global.utils;

module.exports = class extends DynamicProcessor {
    get dp() {
        return 'bees.instances.config.applications';
    }

    /**
     * Applications configuration constructor
     * @param config {object} The applications collection configuration
     */
    constructor(config) {
        super();
        super.setup(new Map([['config', {child: config}]]));
    }

    _prepared(require) {
        const config = this.children.get('config').child;
        config.items.forEach(config => require(config.properties.get('deployment')));
    }

    _process() {
        const config = this.children.get('config').child;

        this.clear();
        config.items.forEach((config, path) => {
            const {scope, name, deployment} = config.valid && config.value ? config.value : {};
            const pkg = (scope ? `@${scope}/` : '') + name;

            let distributions = deployment?.distributions;
            distributions = distributions instanceof Array ? distributions : [];

            distributions
                .filter(distribution => {
                    if (typeof distribution !== 'object') return false;

                    const {name, platform} = distribution;
                    return !!name && ['node', 'ssr', 'backend'].includes(platform);
                })
                .forEach(distribution => {
                    const {name, platform, environment, minify, ports, ts} = distribution;

                    // Actually only node launcher is supported
                    if (!['node', 'ssr', 'backend'].includes(platform)) return;

                    const bundles = distribution.bundles ? distribution.bundles : {};
                    bundles.mode = bundles.mode === 'esm' ? 'esm' : 'cjs';

                    let {imports} = distribution;
                    imports = typeof imports === 'object' ? Object.entries(imports) : [];

                    distribution = {platform, environment, minify, bundles, ts};
                    const key = crc32(equal.generate(distribution));

                    distribution = Object.assign({local: true, key, name, imports}, distribution);
                    this.add({path, pkg, distribution, ports});
                });
        });
    }
}
