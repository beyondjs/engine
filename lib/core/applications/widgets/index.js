const fetch = require('node-fetch');
const DynamicProcessor = global.utils.DynamicProcessor(Map);

/**
 * Keeps an updated list of static rendered widgets
 */
module.exports = class extends DynamicProcessor {
    get dp() {
        return 'application.widgets';
    }

    #application;

    #js;
    get js() {
        return this.#js;
    }

    #errors = [];
    get errors() {
        return this.#errors;
    }

    #warnings = [];
    get warnings() {
        return this.#warnings;
    }

    constructor(application) {
        super();
        this.#application = application;
        this.#js = new (require('./js'))(application);
        super.setup(new Map([['modules', {child: application.modules}]]));
    }

    async url(key, distribution) {
        if (!distribution.ssr) {
            throw new Error('Application must have ssr configured to be able to process static widgets');
        }
        if (!this.has(key)) {
            throw new Error(`Static widget "${key}" not found`);
        }

        const {ssr} = this.#application;
        await ssr.ready(distribution);
        const port = await ssr.port(distribution);

        const {properties, uri, language, attributes: attrs} = this.get(key);

        const {name} = properties.element;

        return (() => {
            const url = `http://localhost:${port}/widget?name=${name}`;

            let qs = '';
            properties.is === 'page' && (qs = `&uri=${uri}`);
            language && (qs += `&language=${language}`);

            if (attrs?.length) {
                const attributes = new Map(attrs);
                const names = [...attributes.keys()].join(',');
                qs += `&attrs=${names}`;
                attributes.forEach((value, param) => qs += `&attrs.${param}=${value}`);
            }

            return encodeURI(`${url}${qs}`);
        })();
    }

    async process(key, distribution) {
        const url = await this.url(key, distribution);

        try {
            const response = await fetch(url);
            const {html, css, store, specs, errors} = await response.json();
            if (errors?.length) return {errors};

            const output = {html, css};
            specs.render?.csr && (output.store = store);
            return output;
        }
        catch (exc) {
            return {errors: [exc.message]};
        }
    }

    _prepared(require) {
        const modules = this.children.get('modules').child;
        modules.forEach(module => {
            if (!require(module) || !require(module.bundles)) return false;
            if (!module.bundles.has('widget')) return;
            const bundle = module.bundles.get('widget');
            require(bundle);
        });
    }

    _process() {
        const modules = this.children.get('modules').child;

        const warnings = this.#warnings = [];
        void (warnings.length); // To avoid a "never queried" warning

        this.clear();
        modules.forEach(module => {
            if (!module.bundles.has('widget')) return;
            const bundle = module.bundles.get('widget');
            if (!bundle.valid) return;

            const {properties} = bundle;
            const widget = properties.element.name;
            if (!properties.render?.sr) return;

            const process = language => {
                if (properties.is === 'page') {
                    const uris = new Set();
                    const {route} = properties;
                    if (!route) return;

                    !route.includes('$') && uris.add(route);
                    const list = properties.render.sr;
                    list.forEach?.(uri => uris.add(uri));

                    uris.forEach(uri => {
                        const key = `${language}${widget}//${uri}`;
                        const resource = `${widget}.${require('./checksum')(key)}.js`;
                        const props = {specifier: bundle.specifier, properties, uri};
                        language && (props.language = language.slice(0, 2));

                        this.set(resource, props);
                    });
                }
                else if (properties.is === 'layout') {
                    // The layouts does not have attributes, so the key is just the widget element name
                    const key = `${language}${widget}`;
                    const resource = `${widget}.${require('./checksum')(key)}.js`;
                    const props = {specifier: bundle.specifier, properties};
                    language && (props.language = language.slice(0, 2));

                    this.set(resource, props);
                }
                else if (!properties.is) {
                    let items = properties.render.sr;
                    items = properties.render.sr instanceof Array ? items : [{}];
                    const attributes = new Set(properties.element.attrs);

                    items.forEach((item, index) => {
                        if (typeof item !== 'object') {
                            warnings.push(`Widget "${widget}" "sr" render entry of index [${index}] is invalid`);
                            return;
                        }

                        const iattrs = new Map(Object.entries(item));

                        const valid = [...iattrs.keys()].reduce((prev, curr) => prev && attributes.has(curr), true);
                        if (!valid) {
                            warnings.push(`Widget "${widget}" "sr" render entry of index [${index}] has invalid attributes`);
                            return;
                        }

                        let key = language;
                        [...iattrs]
                            .sort((a, b) => a[0] < b[0] ? 1 : 0)
                            .forEach(([k, v]) => key += `${k}//${v}///`);

                        const resource = `${widget}.${require('./checksum')(key)}.js`;
                        const props = {specifier: bundle.specifier, properties, attributes: [...iattrs]};
                        language && (props.language = language.slice(0, 2));

                        this.set(resource, props);
                    });
                }
            }

            const {multilanguage} = properties.render;
            if (multilanguage) {
                const languages = this.#application.languages.supported;
                languages.forEach(language => process(`${language}:`));
            }
            else {
                process('');
            }
        });
    }
}
