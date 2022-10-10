const DynamicProcessor = require('beyond/utils/dynamic-processor');
const {bundles: registry} = require('beyond/bundlers-registry');

/**
 * Bundler abstract class
 */
module.exports = class extends DynamicProcessor() {
    get dp() {
        return 'bundle.packager';
    }

    /**
     * The compilation specification key
     * @type {number}
     */
    #ckey;

    /**
     * The PLM packager id
     * @return {string}
     */
    get id() {
        const language = this.#language ? `//${this.#language}` : '//.';
        return `${this.bundle.id}//${this.#ckey}${language}`;
    }

    get bundle() {
        return this.children.get('bundle').child;
    }

    get path() {
        return this.bundle.path;
    }

    get pkg() {
        return this.bundle.pkg;
    }

    #cspecs;
    get cspecs() {
        return this.#cspecs;
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
     * @param cspecs {object} The compilation specification
     * @param language {string} The language
     */
    constructor(bundle, cspecs, language) {
        super();
        this.#cspecs = cspecs;
        this.#language = language;

        super.setup(new Map([['bundle', {child: bundle}]]));

        this.#processors = new (require('./processors'))(this);
        this.#dependencies = new (require('./dependencies'))(this);
        this.#hash = new (require('./hash'))(this);
        this.#consumers = new (require('./consumers'))(this);

        const meta = registry.get(bundle.type);
        if (!(meta.extname instanceof Array)) {
            throw new Error(`Property extname in bundle "${bundle.type}" specification must be an array`);
        }
        if (!meta.extname.includes('.js') && !meta.extname.includes('.css')) {
            throw new Error(`Property extname in bundle "${bundle.type}" ` +
                `specification must include the entries '.js' and/or '.css'`);
        }

        const Js = meta.bundle?.Js ? meta.bundle.Js : require('./code/js');
        this.#js = meta.extname.includes('.js') ? new Js(this) : void 0;

        const Css = meta.bundle?.Css ? meta.bundle.Css : require('./code/css');
        this.#css = meta.extname.includes('.css') ? new Css(this) : void 0;

        this.#declaration = new (require('./declaration'))(this);
    }
}
