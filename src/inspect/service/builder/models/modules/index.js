module.exports = class extends require('../file-manager') {

    skeleton = [
        'path'
    ];

    get structure() {
        /**
         * The file object never has relative item with modules because modules always will
         * be a folder. It's necessary use file property instead of dirname.
         */
        return {path: this.file.relative.file};
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
    }
}
