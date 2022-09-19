const DynamicProcessor = global.utils.DynamicProcessor(Set);

module.exports = class extends DynamicProcessor {
    get dp() {
        return 'bees.instances.config.libraries';
    }

    /**
     * Libraries configuration constructor
     * @param config {object} The libraries collection configuration
     */
    constructor(config) {
        super();
        super.setup(new Map([['config', {child: config}]]));
    }

    _prepared(require) {
        const config = this.children.get('config').child;
        config.items.forEach(library => require(library));
    }

    _process() {
        const config = this.children.get('config').child;

        this.clear();
        config.items.forEach((config, path) => {
            if (!config.valid || !config.value) return;

            const {scope, name, legacyBackend: legacy} = config.value;
            if (typeof legacy !== 'object') return;

            const engine = 'legacy';
            const pkg = (scope ? `@${scope}/` : '') + name;
            const distribution = {name: 'legacy', key: 'legacy', platform: 'legacy'};
            this.add(Object.assign({engine, path, pkg}, {distribution}, {legacy}));
        });
    }
}
