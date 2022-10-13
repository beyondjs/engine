module.exports = class Layout extends require('./widget') {
    _identifier = 'widget';
    skeleton = ['element', 'id', 'hmr', 'ts', 'is'];

    get is() {
        return 'layout';
    }

    constructor(module, path, specs = {}) {
        super(module, path, specs);

        if (!this._id) {
            throw Error(`Property id is necessary, for layout bundle`);
        }
    }

    get id() {
        return this._id;
    }

    set id(value) {
        this._id = value;
    }

}
