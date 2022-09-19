const DynamicProcessor = global.utils.DynamicProcessor();

/**
 * Bundler abstract class
 */
module.exports = class extends DynamicProcessor {
    get dp() {
        return 'bundle.packager';
    }

    get is() {
        return 'bundlePackager';
    }

    get id() {
        const language = this.#language ? `//${this.#language}` : '//.';
        return `${this.bundle.id}//${this.#distribution.key}${language}`;
    }

    get bundle() {
        return this.children.get('bundle').child;
    }

    get path() {
        return this.bundle.path;
    }

    get application() {
        return this.bundle.application;
    }

    #distribution;
    get distribution() {
        return this.#distribution;
    }

    #language;
    get language() {
        return this.#language;
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

    #hash;
    get hash() {
        return this.#hash;
    }

    #processors;
    get processors() {
        return this.#processors;
    }

    #dependencies;
    get dependencies() {
        return this.#dependencies;
    }

    #consumers;
    get consumers() {
        return this.#consumers;
    }

    /**
     * Bundler constructor
     *
     * @param bundle {object} The bundle
     * @param distribution {object} The distribution specification
     * @param language {string} The language
     */
    constructor(bundle, distribution, language) {
        if (!distribution || !distribution.key) throw new Error('Invalid parameters');

        super();
        this.#distribution = distribution;
        this.#language = language;

        super.setup(new Map([['bundle', {child: bundle}]]));

        this.#processors = new (require('./processors'))(this);
        this.#dependencies = new (require('./dependencies'))(this);
        this.#hash = new (require('./hash'))(this);
        this.#consumers = new (require('./consumers'))(this);

        const meta = global.bundles.get(bundle.type);
        if (!(meta.extname instanceof Array)) {
            throw new Error(`Property extname in bundle "${bundle.type}" specification must be an array`);
        }
        if (!meta.extname.includes('.js') && !meta.extname.includes('.css')) {
            throw new Error(`Property extname in bundle "${bundle.type}" specification must include the entries '.js' and/or '.css'`);
        }

        const JsCode = meta.bundle?.Js ? meta.bundle.Js : require('./code/js');
        this.#js = meta.extname.includes('.js') ? new JsCode(this) : void 0;

        const CssCode = meta.bundle?.Css ? meta.bundle.Css : require('./code/css');
        this.#css = meta.extname.includes('.css') ? new CssCode(this) : void 0;

        this.#declaration = new (require('./declaration'))(this);
    }
}
