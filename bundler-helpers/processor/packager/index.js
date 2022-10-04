/**
 * BeyondJS Processor Packager abstract class
 */
module.exports = class {
    get is() {
        return 'processorPackager';
    }

    #processor;
    get processor() {
        return this.#processor;
    }

    get id() {
        return this.#processor.id;
    }

    get application() {
        return this.#processor.application;
    }

    get distribution() {
        return this.#processor.distribution;
    }

    get language() {
        return this.#processor.language;
    }

    #compiler;
    get compiler() {
        return this.#compiler;
    }

    #declaration;
    get declaration() {
        return this.#declaration;
    }

    #js;
    get js() {
        return this.#js;
    }

    #css;
    get css() {
        return this.#css;
    }

    #hmr;
    get hmr() {
        return this.#hmr;
    }

    /**
     * Processor packager constructor
     *
     * @param processor {object} The processor object
     */
    constructor(processor) {
        this.#processor = processor;

        const {compiler, Js, Css, declaration} = processor.meta.packager;

        const Compiler = compiler?.(this);
        this.#compiler = Compiler ? new Compiler(this) : void 0;

        this.#js = Js ? new Js(this, '.js') : void 0;
        this.#css = Css ? new Css(this, '.css') : void 0;

        const Declaration = declaration?.(this);
        this.#declaration = Declaration ? new Declaration(this) : void 0;

        this.#hmr = Js ? new (require('./hmr'))(this) : void 0;
    }

    /**
     * The ts processor extends the packager and adds the analyzer and options object (to read the tsconfig).
     * Then the code object (js) requires both the analyzer and the options,
     * but both are not available in its constructor, as it is called from the constructor of the packager,
     * and it has not been executed yet. Something similar occurs with the compiler.
     * This is why it is required to have a .setup method.
     */
    setup() {
        this.#compiler?.setup();
        this.#declaration?.setup();
        this.#js?.setup();
        this.#css?.setup();
    }

    destroy() {
        this.#compiler?.destroy();
        this.#declaration?.destroy();
        this.#js?.destroy();
        this.#css?.destroy();
    }

    configure(config) {
        const {code, multilanguage} = config;
        this.#js?.configure?.(Object.assign({}, code, {multilanguage}));
        this.#css?.configure?.(Object.assign({}, code, {multilanguage}));
    }
}
