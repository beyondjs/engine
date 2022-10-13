module.exports = class Widget extends require('../bundle') {
    _identifier = 'widget';
    skeleton = [
        'hmr', 'element', 'ts', 'name', 'is', 'layout', 'route', 'id'
    ];
    _processors = new Map();
    _module;

    #element;
    get element() {
        return this.#element.getProperties();
    }

    set element(value) {
        this.#element.set(value);
    }

    /**
     *
     * @param path Dirname where is the module.json located.
     * @param specs parameters of the module with the configuration of the file.
     * TODO: @julio is necessary build all bundles with the same parameters.
     */
    constructor(path, specs = {}) {
        super(path, 'widget', specs);
        this.#element = new (require('./element'))(path, 'widget-element', specs);
        this._checkProperties(specs);
    }

    getProperties() {
        const props = super.getProperties();
        props.element = this.element;
        return props;
    }
}
