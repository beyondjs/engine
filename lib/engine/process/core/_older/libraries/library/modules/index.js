const {FinderCollection} = global.utils;

module.exports = class extends FinderCollection {
    #library;
    get library() {
        return this.#library;
    }

    constructor(library) {
        super(library.watcher, require('./module'));
        this.#library = library;
    }

    configure(path) {
        const library = this.#library;
        path = path ? require('path').join(library.path, path) : library.path;
        super.configure(path, {filename: 'module.json', excludes: ['./builds']});
    }
}
