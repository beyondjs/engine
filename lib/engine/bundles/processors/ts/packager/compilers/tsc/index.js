module.exports = class extends global.ProcessorCompiler {
    get dp() {
        return 'ts.compiler';
    }

    get is() {
        return 'tsc';
    }

    #CompiledSource = require('../source');
    get CompiledSource() {
        return this.#CompiledSource;
    }

    get declarations() {
        return this.children.get('dependencies.declarations')?.child;
    }

    #tsBuildInfo;
    get tsBuildInfo() {
        return this.#tsBuildInfo;
    }

    #program;
    get program() {
        return this.#program;
    }

    constructor(packager) {
        super(packager, require('./children'));
        this.notifyOnFirst = true; // Notify a 'change' event when the first process is completed
    }

    _prepared(require) {
        const prepared = super._prepared(require);
        if (typeof prepared === 'string' || (typeof prepared === 'boolean' && !prepared)) return prepared;

        if (this.updated && !this.children.has('dependencies.declarations')) return;

        const dependencies = this.children.get('dependencies.declarations').child;
        if (!dependencies.synchronized) return 'dependencies declarations are not synchronized';
    }

    _compile(updated, diagnostics) {
        this.#program = this.#program ? this.#program : new (require('./program'))(this);
        const tsBuildInfo = this.#program.emit(updated, diagnostics);

        // tsBuildInfo can be undefined when the compiler do not detect changes, so keep its last value
        tsBuildInfo && (this.#tsBuildInfo = tsBuildInfo);
    }

    hydrate(cached) {
        this.#tsBuildInfo = cached.tsBuildInfo;
        super.hydrate(cached);
    }

    toJSON() {
        const json = super.toJSON();
        json.tsBuildInfo = this.#tsBuildInfo;
        return json;
    }
}
