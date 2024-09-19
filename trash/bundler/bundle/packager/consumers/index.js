const {ipc} = global.utils;
const DynamicProcessor = global.utils.DynamicProcessor(Set);

module.exports = class extends DynamicProcessor {
    get dp() {
        return 'bundler.bundle.consumers';
    }

    #bundle;

    constructor(packager) {
        super();
        const {bundle, distribution, language} = packager;
        const {application} = bundle.container;
        this.#bundle = bundle;

        const consumers = application.consumers.get(distribution, language);
        super.setup(new Map([['consumers', {child: consumers}]]));
    }

    _process() {
        let consumers = this.children.get('consumers').child;
        consumers = consumers.has(this.#bundle.id) ? consumers.get(this.#bundle.id) : new Set();

        let changed = consumers.size !== this.size;
        !changed && consumers.forEach(consumer =>
            changed = changed ? changed : !this.has(consumer.id));

        if (!changed) return false;

        this.clear();
        consumers.forEach(consumer => this.add(consumer));
    }

    _notify() {
        ipc.notify('data-notification', {
            type: 'list/update',
            table: 'bundles-consumers',
            filter: {bundle: this.#bundle.id}
        });
    }
}
