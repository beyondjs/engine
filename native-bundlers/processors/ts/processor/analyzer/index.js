const {ProcessorSinglyAnalyzer} = require('beyond/bundler-helpers');

module.exports = class extends ProcessorSinglyAnalyzer {
    // The information of the classes and methods exposed by the bridges required by the server to verify the requests
    #bridges = new Map();
    get bridges() {
        return this.#bridges;
    }

    get AnalyzedSource() {
        return require('./source');
    }

    // Analyze a source
    _analyzeSource(source) {
        const {specs} = this.processor;
        const {bundle, cspecs} = specs;
        const {platform} = cspecs;

        const bridge = bundle.type === 'bridge' ? require('./bridge')(source, cspecs) : void 0;
        const is = bundle.type === 'bridge' && platform !== 'backend' ? 'bridge' : 'file';

        // The files of the bridges that doesn't expose any actions are undefined and must be discarded
        if (is === 'bridge' && !bridge) return;

        const {content} = is === 'bridge' ? bridge : source;

        // Extract the dependencies and exports information from the file
        const {dependencies, exports} = require('./interface')(source.relative.file, content);
        const data = {dependencies, exports, bridge: bridge?.info, content};
        return new this.AnalyzedSource(this.processor, cspecs, 'source', source, data);
    }

    // Once all files were individually analyzed
    _finalize() {
        this.#bridges.clear();

        this.files.forEach(source => {
            source.bridge?.forEach(
                (methods, className) => this.#bridges.set(className, methods))
        });
    }
}
