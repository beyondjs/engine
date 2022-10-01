const File = require('../../files/file');

module.exports = class {
    #finder;
    #inclusions;
    #listener;

    #destroyed = false;
    get destroyed() {
        return this.#destroyed;
    }

    #createListener = () => {
        const {watcher, specs, path} = this.#finder;
        if (!watcher) return;

        let includes = specs.includes.includes('*') ? undefined : specs.includes;
        includes = typeof includes === 'string' ? [includes] : includes;

        const excludes = typeof specs.excludes === 'string' ? [specs.excludes] : specs.excludes;

        this.#listener = watcher.listeners.create(path, {
            'includes': includes,
            'excludes': excludes,
            'filename': specs.filename,
            'extname': specs.extname
        });

        this.#listener.on('add', this.#add);
        this.#listener.on('unlink', this.#unlink);
        this.#listener.on('change', this.#change);

        this.#listener.listen().catch(exc => console.error(exc.stack));
    };

    constructor(finder, inclusions) {
        this.#finder = finder;
        this.#inclusions = inclusions;

        this.#createListener();
    }

    #change = (file) => {
        if (this.#destroyed) {
            console.warn(`Event received on a destroyed listener. File: "${file}".`);
            return;
        }

        file = new File(this.#finder.path, file);
        this.#finder.processed && this.#finder.emit('file.change', file);
    }

    #add = (file) => {
        if (this.#destroyed) {
            console.warn(`Event received on a destroyed listener. File: "${file}".`);
            return;
        }

        let changed = false;
        this.#inclusions.forEach(inclusion => inclusion.push(file) && (changed = true));
        changed && this.#finder.processed && this.#finder._invalidate();
    }

    #unlink = (file) => {
        if (this.#destroyed) {
            console.warn(`Event received on a destroyed listener. File: "${file}".`);
            return;
        }

        let changed = false;
        this.#inclusions.forEach(inclusion => inclusion.delete(file) && (changed = true));
        changed && this.#finder.processed && this.#finder._invalidate();
    }

    destroy() {
        this.#destroyed = true;
        this.#listener.destroy();
    }
}
