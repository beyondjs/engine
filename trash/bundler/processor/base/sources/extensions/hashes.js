const DynamicProcessor = global.utils.DynamicProcessor();
const {crc32, equal} = global.utils;

module.exports = class extends DynamicProcessor {
    get dp() {
        return 'processor.sources.extensions.hashes';
    }

    // The root hashes of each extension
    #roots = new Map();
    get roots() {
        return this.#roots;
    }

    get synchronized() {
        const es = this.children.get('extensions.sources').child;
        const esh = es.children.get('extensions.hashes')?.child;
        if (!esh) return true;

        return [...esh].reduce((prev, [processor, eh]) =>
            prev && eh.synchronized && this.#roots.get(processor) === eh.root, true);
    }

    constructor(extensions) {
        super();
        super.setup(new Map([['extensions.sources', {child: extensions}]]));
    }

    // The calculated hash of the extensions sources
    #sources;
    get sources() {
        if (this.#sources !== void 0) return this.#sources;

        // Extensions is a list of sources populated from the preprocessed sources of all extensions
        const extensions = this.children.get('extensions.sources').child;
        if (!extensions.size) return (this.#sources = 0);

        const compute = {};
        const esh = extensions.children.get('extensions.hashes').child;
        esh.forEach((eh, processor) => compute[processor] = eh.sources);
        return this.#sources = crc32(equal.generate(compute));
    }

    _process() {
        this.#sources = void 0;
        this.#roots.clear();

        const es = this.children.get('extensions.sources').child;
        const esh = es.children.get('extensions.hashes')?.child;
        esh?.forEach((eh, processor) => this.#roots.set(processor, eh.root));
    }
}
