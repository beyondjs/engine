const DynamicProcessor = global.utils.DynamicProcessor(Map);
const ProcessorsCodeExtensions = (require('./processors'));

/**
 * The files collected from the extensions of the current processor
 */
module.exports = class extends DynamicProcessor {
    get dp() {
        return 'processor.code.extensions';
    }

    #packager;
    get packager() {
        return this.#packager;
    }

    #template;

    constructor(packager) {
        super();
        this.#packager = packager;

        const {bundle} = packager.processor.specs;
        this.#template = bundle.name.startsWith('template/');
        if (this.#template) return;

        // The extensions of the current processor being extended by other processors of the same bundle
        const events = ['code.initialised', 'code.change'];
        super.setup(new Map([['extensions.code', {child: new ProcessorsCodeExtensions(packager), events}]]));
    }

    _prepared(check) {
        if (this.#template) return;
        const extensions = this.children.get('extensions.code').child;
        extensions.forEach(extension => check(extension));
    }

    _process() {
        if (this.#template) return;
        const extensions = this.children.get('extensions.code').child;
        this.clear();

        extensions.forEach(extension => extension.forEach((compiled, file) => this.set(file, compiled)));
    }
}
