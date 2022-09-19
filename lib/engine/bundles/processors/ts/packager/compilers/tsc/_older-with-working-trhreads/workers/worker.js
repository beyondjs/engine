const {Worker} = require('worker_threads');

module.exports = class {
    #worker;

    #promise;

    get processing() {
        return !!this.#promise;
    }

    constructor() {
        const path = require('path').join(__dirname, './compiler/index.js');
        this.#worker = new Worker(path);

        this.#worker.on('message', this.#onMessage);
        this.#worker.on('error', this.#onError);
    }

    #onError = error => console.log(`TS compiler error: `, error);

    #onMessage = message => {
        if (!this.#promise) throw new Error(`Worker received a message, but it's inactive`);
        if (message.type !== 'processed' || !message.data) throw new Error('Invalid message');

        const {files, diagnostics, tsBuildInfo} = JSON.parse(message.data);
        const compilation = {
            tsBuildInfo,
            files: new Map(files),
            diagnostics: {
                general: diagnostics.general,
                dependencies: new Map(diagnostics.dependencies),
                files: new Map(diagnostics.files)
            }
        };

        const p = this.#promise;
        this.#promise = undefined;
        p.resolve(compilation);
    };

    async process(path, dependencies, analyzer, options, tsBuildInfo) {
        if (this.#promise) throw new Error('Worker is processing');
        if (!path || !analyzer || !options) throw new Error('Invalid parameters');
        this.#promise = Promise.pending();

        const sources = {dependencies: new Map(), files: new Map()};
        analyzer.files.forEach(source => sources.files.set(source.file, {
            hash: source.hash, content: source.content
        }));
        analyzer.extensions.forEach(source => sources.files.set(source.file, {
            hash: source.hash, content: source.content
        }));
        dependencies.forEach(dependency => sources.dependencies.set(dependency.resource, {
                hash: dependency.declaration.hash,
                dts: dependency.declaration.value,
                kind: dependency.kind
            })
        );

        this.#worker.postMessage({
            path,
            options,
            tsBuildInfo,
            sources: {
                dependencies: [...sources.dependencies.entries()],
                files: [...sources.files.entries()]
            }
        });

        return this.#promise.value;
    }
}
