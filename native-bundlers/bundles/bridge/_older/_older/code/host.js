const DynamicProcessor = global.utils.DynamicProcessor();

module.exports = class extends DynamicProcessor {
    get dp() {
        return 'bundles.bridge.host';
    }

    #port;

    get bee() {
        return this.#port.bee;
    }

    #value;
    get value() {
        return this.#value;
    }

    constructor(application, distribution) {
        super();
        this.#port = new (require('./port'))();
        super.setup(new Map([['application', {child: application}], ['distribution', {child: distribution}]]));

        this.#port.on('change', this._invalidate);
    }

    _prepared() {
        const application = this.children.get('application').child;
        const distribution = this.children.get('distribution').child;

        if (distribution.local) return true;

        this.#port.update(application.package, distribution.name);
        return this.#port.ready;
    }

    _process() {
        const distribution = this.children.get('distribution').child;
        if (!distribution.local) {
            this.#value = distribution.host;
            return;
        }

        this.#value = `http://localhost:${this.#port.value}`;
    }

    destroy() {
        super.destroy();
        this.#port.off('change', this._invalidate);
    }
}
