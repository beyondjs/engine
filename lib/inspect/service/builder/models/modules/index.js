module.exports = class extends require('../file-manager') {

    skeleton = [
        'path'
    ];

    get structure() {
        return {path: this.file.relative.dirname};
    }

    set(data) {
        this._checkProperties(data);
        const path = this.path ?? 'modules';
        this.file.setBasename(path);
    }

    /**
     * Set "modules" path as default folder for modules.
     */
    setDefault() {
        this.path = require('path').join(this.file.dirname, 'modules');
        this.file.setBasename('modules');
    }
}
