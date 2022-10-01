module.exports = class extends global.Bundle {
    #properties;
    get properties() {
        return this.#properties;
    }

    processConfig(config) {
        if (!['object', 'string'].includes(typeof config)) {
            return {errors: ['Invalid configuration']};
        }
        config = Object.assign({}, config);

        const warnings = [];
        this.#properties = undefined;

        if (!['object', 'string'].includes(typeof config)) return {errors: ['Invalid configuration']};
        if (typeof config.element !== 'object') return {errors: ['Element configuration is invalid or not set']};

        const {element} = config;
        if (typeof element.name !== 'string') return {errors: ['Element name must be set']};
        const validation = require('./validate-name')(element.name);
        if (validation.error) return {errors: [validation.error]};

        // Validate the render property
        let {render, multilanguage} = (() => {
            let {render} = config;
            if (!render) return {};
            if (typeof render !== 'object') {
                render && warnings.push('Render property must be on object');
                return {};
            }

            let {csr, ssr, sr, multilanguage} = render;

            const value = {};
            value.csr = csr === void 0 ? true : !!csr;
            value.ssr = ssr === void 0 ? false : !!ssr;
            value.sr = (() => {
                if (sr === void 0) return false;
                if (typeof sr !== 'object') return !!sr;
                if (!(sr instanceof Array)) {
                    warnings.push('Render ".sr" property must be an array or a boolean value');
                    return false;
                }
                return sr;
            })();

            // Remove the properties that are set as its default to reduce size
            value.csr === true && delete value.csr;
            value.ssr === false && delete value.ssr;
            value.sr === false && delete value.sr;

            return {render: value, multilanguage};
        })();

        if (config.is && !['layout', 'page'].includes(config.is)) return {errors: ['Property "is" is invalid']};

        const attrs = require('./attrs')(config.element.attrs, warnings);
        this.#properties = {element: {name: config.element.name}};
        attrs && (this.#properties.element.attrs = attrs);
        render && Object.entries(render).length && (this.#properties.render = render);
        render && this.#properties.render && multilanguage && (this.#properties.render.multilanguage = true);

        config.is && (this.#properties.is = config.is);

        config.is === 'page' && typeof config.route === 'string' && (this.#properties.route = config.route);
        ['page', 'layout'].includes(config.is) && typeof config.layout === 'string' && (this.#properties.layout = config.layout);

        delete config.is;
        delete config.layout;
        delete config.route;
        delete config.element;
        delete config.render;

        const output = {value: config};
        output.warnings = warnings ? warnings : [];
        validation.warning && output.warnings.push(validation.warning);
        return output;
    }
}
