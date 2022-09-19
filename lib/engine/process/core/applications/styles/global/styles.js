const DynamicProcessor = global.utils.DynamicProcessor();
const {ipc} = global.utils;

module.exports = class extends DynamicProcessor {
    get dp() {
        return 'application.styles.global.code';
    }

    get #code() {
        return this.children.get('code')?.child;
    }

    get diagnostics() {
        return this.#code?.diagnostics;
    }

    get valid() {
        return this.#code ? this.#code.valid : true;
    }

    get value() {
        return this.#code?.code;
    }

    _notify() {
        ipc.notify('global-styles', {type: 'update'});
    }

    constructor(template, distribution) {
        super();
        const processor = template.processors.get(distribution);
        super.setup(new Map([['processor', {child: processor}]]));
    }

    _prepared() {
        const {children} = this;
        const processor = children.get('processor').child;
        const code = processor.instance?.packager.css;

        children.has('code') && children.get('code')?.child !== code && children.unregister(['code']);
        code && children.register(new Map([['code', {child: code}]]));
    }

    _process() {
    }
}
