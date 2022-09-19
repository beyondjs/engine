/**
 * The BeyondJS compiler for less and scss
 */
module.exports = class extends global.ProcessorCompiler {
    get dp() {
        return 'css.compiler';
    }

    #code;
    get code() {
        return this.#code;
    }

    constructor(packager) {
        super(packager);

        const {functions} = packager.processor.sources;
        functions && super.setup(new Map([['functions', {child: functions.code}]]));
    }

    async _compile(updated, diagnostics, meta, request) {
        const files = this.children.get('files').child;
        const overwrites = this.children.get('overwrites')?.child;
        const functions = this.children.get('functions')?.child;

        // Check if functions are valid
        if (functions && !functions.valid) {
            diagnostics.general.push('Errors found compiling the template functions');
            return;
        }

        // Verify that the functions do not contain css code, because in that case they would
        // be injecting code in each file of each processor
        if (functions?.value) {
            diagnostics.general.push(`The template functions must contain only functions and not css code.` +
                `<br/><br/>${functions.value}`);
            return;
        }

        let input = {sources: [], code: ''};
        const addSources = collection => collection.forEach(source => {
            input.sources.push(source);
            input.code += source.content + '\n';
        });
        addSources(files);
        overwrites && addSources(overwrites);

        const data = (functions?.source ? functions.source.code : '') + input.code;
        const {name} = this.packager.processor;
        const {code, errors} = await require(`./${name}`)(data);
        if (request !== this._request) return;

        // Process the diagnostics
        errors && require('./diagnostics')(errors, input, functions, diagnostics);
        this.#code = code;
    }

    hydrate(cached) {
        super.hydrate(cached);
        this.#code = cached.code;
    }

    toJSON() {
        return Object.assign({code: this.#code}, super.toJSON());
    }
}
