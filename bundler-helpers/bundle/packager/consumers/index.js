const DynamicProcessor = require('beyond/utils/dynamic-processor');
const ipc = require('beyond/utils/ipc');

module.exports = class extends DynamicProcessor(Set) {
    get dp() {
        return 'bundler.bundle.consumers';
    }

    #bundle;

    constructor(packager) {
        super();
        const {bundle, cspecs, language} = packager;
        this.#bundle = bundle;

        const consumers = bundle.module.pkg.consumers.get(cspecs, language);
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
