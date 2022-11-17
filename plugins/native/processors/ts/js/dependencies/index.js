const DynamicProcessor = require('beyond/utils/dynamic-processor');
const Dependency = require('./dependency');

module.exports = class extends DynamicProcessor(Map) {
    get dp() {
        return 'ts-processor.dependencies';
    }

    #analyzer;

    constructor(analyzer) {
        super();
        this.#analyzer = analyzer;
    }

    _prepared(require) {
        require(this.#analyzer.files);
    }

    _process() {
        const {files} = this.#analyzer;

        this.clear();

        files.forEach(file => {
            file.dependencies.forEach(dependencyFile => {
                const {specifier} = dependencyFile;

                const dependency = this.has(specifier) ? this.get(specifier) : new Dependency(specifier);
                dependency.sources.push(dependencyFile);
                dependency.is.add(dependencyFile.is);

                this.set(specifier, dependency);
            });
        });
    }
}
