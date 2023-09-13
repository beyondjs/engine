module.exports = class Layout extends require('./widget') {
    _identifier = 'widget';
    skeleton = ['element', 'id', 'hmr', 'ts', 'is'];

    get is() {
        return 'layout';
    }

    get id() {
        return this._id;
    }

    set id(value) {
        this._id = value;
    }

}
