const DynamicProcessor = global.utils.DynamicProcessor();

/**
 * Transversal bundler abstract class
 */
module.exports = class extends DynamicProcessor {
    get dp() {
        return 'transversal.packager';
    }

    get is() {
        return 'transversalPackager';
    }

    get id() {
        const language = this.#language ? `//${this.#language}` : '//.';
        return `${this.#transversal.id}//${this.#distribution.key}${language}`;
    }

    // The transversal bundle
    #transversal;
    get transversal() {
        return this.#transversal;
    }

    get application() {
        return this.#transversal.application;
    }

    #distribution;
    get distribution() {
        return this.#distribution;
    }

    #language;
    get language() {
        return this.#language;
    }

    #hash;
    get hash() {
        return this.#hash;
    }

    #js;
    get js() {
        return this.#js;
    }

    #dependencies;
    get dependencies() {
        return this.#dependencies;
    }

    #errors;
    get errors() {
        return this.#errors ? this.#errors : [];
    }

    get valid() {
        return !this.errors.length;
    }

    /**
     * Transversal bundle packager constructor
     *
     * @param transversal {object} The transversal bundle
     * @param distribution {object} The distribution specification
     * @param language {string} The language
     */
    constructor(transversal, distribution, language) {
        super();
        this.#transversal = transversal;
        this.#distribution = distribution;
        this.#language = language;

        // The bundles packagers of transversal bundle of the modules and libraries of the application
        const bundles = new (require('./bundles'))(this);

        this.#hash = bundles.hash;
        this.#dependencies = new (require('./dependencies'))(this, bundles);

        const meta = global.bundles.get(transversal.name);
        let Js = meta.transversal.JsPackager;
        Js = Js ? Js : require('./code');
        this.#js = new Js(this, bundles);
    }

    // Nothing is required to be done, as the configuration of the transversals
    // are not actually used
    _process() {
    }
}
