const sass = require('sass');
const toHtml = new (require('ansi-to-html'));

module.exports = class extends global.ProcessorSinglyCompiler {
    get dp() {
        return 'sass.compiler';
    }

    #dependencies;
    #hash;
    get hash() {
        return super.hash + this.#hash.value;
    }

    constructor(packager) {
        super(packager, require('./children'));
        this._autoSaveCache = false;

        this.#dependencies = new (require('./dependencies'))(this);
        super.setup(new Map([['dependencies.hash', {child: this.#dependencies.hash}]]));
    }

    async hydrate(cached) {
        // The hydrate method is synchronous
        super.hydrate(cached);
        this.#hash = cached.data.sass.hash;
        await this.#dependencies.update(this.meta);
    }

    toJSON() {
        const json = super.toJSON();
        json.sass = {hash: this.#hash};
        return json;
    }

    async _compileSource(source, is, request) {
        if (source.basename.startsWith('_')) return {};

        const importer = new (require('./importer'))(this.packager);
        const {processor} = this.packager;
        const options = {sourceMap: true, importer};

        let result;
        try {
            result = await sass.compileStringAsync(source.content, options);
            if (this._request !== request) return;
        }
        catch (exc) {
            let message = toHtml.toHtml(exc.message);
            message = message.replace(/\n/g, '<br/>');
            message = `<div style="background: #ddd; color: #333;">${message}</div>`;

            const compiled = new this.CompiledSource(processor, source.is, source, {});
            const errors = [message];
            return {compiled, errors};
        }

        const {css, sourceMap: map} = result;
        const code = css.toString();
        map.sources[0] = source.url;

        const compiled = new this.CompiledSource(processor, source.is, source, {code, map});
        return {compiled, data: {dependencies: [...importer.dependencies]}};
    }

    get #updated() {
        console.log('#updated property', this.#hash, this.children.get('dependencies.hash').child.value);
        return this.#hash === this.children.get('dependencies.hash').child.value;
    }

    async _process(request) {
        console.log('process, updated:', super.updated, this.#updated);
        if (super.updated && this.#updated) return;
        this.#dependencies.request = request;
        this.files.clear();
        console.log('files cleared');

        await super._process(request);
        if (this._request !== request) return;

        // The dependencies are updated on initialisation (hydrate method)
        await this.#dependencies.update(this.meta, request);

        this.hold('dependencies.hash');
        const hash = this.children.get('dependencies.hash').child;
        await hash.ready;
        this.#hash = hash.value;
        this.release('dependencies.hash');

        // Because of holder, invalidate if processor changed
        this._request !== request && this._invalidate();

        this._cache.save().catch(exc => console.log(exc.stack));
        console.log('New processed hash:', this.#hash);
    }
}
