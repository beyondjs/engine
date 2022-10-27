const DynamicProcessor = global.utils.DynamicProcessor();
const {crc32, equal} = global.utils;

module.exports = class extends DynamicProcessor {
    get dp() {
        return 'processor.analyzer.hash';
    }

    #analyzer;
    get analyzer() {
        return this.#analyzer;
    }

    constructor(analyzer) {
        super();
        this.#analyzer = analyzer;

        const events = ['item.initialised', 'item.change'];
        const {processor} = analyzer;
        const {files, overwrites, extensions} = processor.sources;
        const children = [
            ['files', {child: files, events}],
            ['extensions', {child: extensions, events}]
        ];
        overwrites && children.push(['overwrites', {child: overwrites, events}]);
        super.setup(new Map(children));
    }

    #value;
    get value() {
        return this.#value;
    }

    _prepared(check) {
        const {files, overwrites} = this.#analyzer.processor.sources;
        files.forEach(source => check(source));
        overwrites?.forEach(source => check(source));
    }

    _process() {
        const {files, overwrites, extensions} = this.#analyzer.processor.sources;
        const compute = {};
        files.forEach(source => compute[source.file] = source.hash);
        overwrites?.forEach(source => compute[source.file] = source.hash);
        extensions.forEach(source => compute[source.file] = source.hash);

        const value = crc32(equal.generate(compute));
        const changed = value !== this.#value;
        this.#value = value;
        return changed;
    }
}
