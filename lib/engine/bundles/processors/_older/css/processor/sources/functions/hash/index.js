const DynamicProcessor = global.utils.DynamicProcessor();

module.exports = class extends DynamicProcessor {
    get dp() {
        return 'css-processor.functions.hash';
    }

    get value() {
        this.children.has('hashes') ? this.children.get('hashes').child.sources : 0;
    }

    constructor(template) {
        super();
        this.setMaxListeners(500);
        super.setup(new Map([['template', {child: template}]]));
    }

    _prepared() {
        const {children} = this;
        const {instance} = children.get('template').child;

        if (children.has('hashes')) {
            if (children.get('hashes').child === instance?.hashes) return;
            children.unregister(['hashes']);
        }
        instance && children.register(new Map([['hashes', {child: instance.hashes}]]));
    }
}
