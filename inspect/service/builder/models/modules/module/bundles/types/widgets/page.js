module.exports = class Page extends require('./widget') {
    _identifier = 'page';

    skeleton = [
        'hmr', 'element', 'ts', 'name', 'route', 'layout', 'is'
    ];

    get is() {
        return 'page';
    }

    /**
     *
     * @param dirname Parent module object.
     * @param specs parameters of the module with the configuration of the file.
     */
    constructor(dirname, specs = {}) {
        super(dirname, specs);
        this._checkProperties(specs);
    }

}
