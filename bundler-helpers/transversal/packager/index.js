const DynamicProcessor = require('beyond/utils/dynamic-processor');
const bundlers = require('beyond/bundlers-registry');

/**
 * Transversal bundler abstract class
 */
module.exports = class extends DynamicProcessor() {
    get dp() {
        return 'transversal.packager';
    }

    get id() {
        const language = this.#language ? `//${this.#language}` : '//.';
        return `${this.#transversal.id}//${this.#cspecs.key}${language}`;
    }

    // The transversal bundle
    #transversal;
    get transversal() {
        return this.#transversal;
    }

    get application() {
        return this.#transversal.application;
    }

    #cspecs;
    get cspecs() {
        return this.#cspecs;
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
     * @param cspecs {object} The compilation specification
     * @param language {string} The language
     */
    constructor(transversal, cspecs, language) {
        super();
        this.#transversal = transversal;
        this.#cspecs = cspecs;
        this.#language = language;

        // The bundles packagers of transversal bundle of the modules and libraries of the application
        const bundles = new (require('./bundles'))(this);

        this.#hash = bundles.hash;
        this.#dependencies = new (require('./dependencies'))(this, bundles);

        const meta = bundlers.bundles.get(transversal.name);
        let Js = meta.transversal.JsPackager;
        Js = Js ? Js : require('./code');
        this.#js = new Js(this, bundles);
    }

    // Nothing is required to be done, as the configuration of the transversals
    // are not actually used
    _process() {
    }
}
