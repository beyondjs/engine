module.exports = class extends global.ProcessorSourcesHashes {
    get dp() {
        return 'sass.processor.sources.hashes';
    }

    constructor(sources) {
        super(sources);

        const {template} = sources;
        template && super.setup(new Map([['template', {child: template}]]));
    }

    _prepared(require) {
        const prepared = super._prepared(require);
        if (typeof prepared === 'string' || (typeof prepared === 'boolean' && !prepared)) return prepared;

        if (!this.children.has('template')) return;
        const {instance} = this.children.get('template').child;
        if (!instance) return;

        require(instance.sources.hashes);
    }

    _compute() {
        if (!this.children.has('template')) return;
        const {instance} = this.children.get('template').child;
        return instance ? instance.sources.hashes.sources : 0;
    }
}
