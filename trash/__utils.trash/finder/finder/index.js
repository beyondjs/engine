const DynamicProcessor = require('../../dynamic-processor')();

module.exports = class extends DynamicProcessor {
    get dp() {
        return 'utils.finder';
    }

    #watcher;
    get watcher() {
        return this.#watcher;
    }

    #path;
    get path() {
        return this.#path;
    }

    #specs;
    get specs() {
        return this.#specs;
    }

    get filename() {
        return this.#specs.filename;
    }

    get extname() {
        return this.#specs.extname;
    }

    get includes() {
        return this.#specs.includes;
    }

    get excludes() {
        return this.#specs.excludes;
    }

    #inclusions;
    #listener;

    get [Symbol.iterator]() {
        return require('./iterator')(this.#specs.includes, this.#inclusions);
    }

    get errors() {
        const output = [];
        this.#inclusions.forEach(inclusion => output.push(...inclusion.errors));
        return output;
    }

    #warnings = [];
    get warnings() {
        return this.#warnings;
    }

    get files() {
        const files = new (require('./inclusion/files'))(this.#path, this.#specs);
        this.#specs.includes.forEach(include => files.append(this.#inclusions.get(include)));
        return Object.freeze(files);
    }

    get missing() {
        const output = [];
        this.#inclusions.forEach(inclusion => !inclusion.length && output.push(inclusion.entry));
        return output;
    }

    get length() {
        let length = 0;
        this.#inclusions.forEach(inclusion => length += inclusion.length);
        return length;
    }

    /**
     * Static finder constructor
     * @param path {string} The path where to find the files
     * @param specs {object | string | function | array}
     *      . includes {array} Array of files or folders to be included in the search
     *      . excludes {array} The files or folders to be excluded of the search
     *      . filename {string} The name of the files to be found
     *      . extname {string | Array} The extension of the files to be found
     *      . filter {function} Function to filter files
     * @param watcher {object} Files watcher to listen for file changes
     */
    constructor(path, specs, watcher) {
        super();
        if (watcher && !(watcher instanceof global.utils.watchers.BackgroundWatcher)) {
            throw new Error('watcher parameter is not a valid background watcher');
        }

        specs = require('./parameters.js')(path, specs);

        this.#watcher = watcher;
        this.#path = path;
        this.#specs = specs;

        this.#inclusions = new Map();
        for (const entry of specs.includes) {
            if (typeof entry !== 'string') {
                this.#warnings.push(`${entry} is not a string`);
                continue;
            }
            const inclusion = new (require('./inclusion'))(path, entry, specs);
            this.#inclusions.set(entry, inclusion);
        }
    }

    #timer;

    emit(event, ...params) {
        if (event === 'change') {
            clearTimeout(this.#timer);
            this.#timer = setTimeout(() => this._events.emit(event, ...params), 10);
            return;
        }
        return this._events.emit(event, ...params);
    }

    async _begin() {
        this.#listener = new (require('./listener'))(this, this.#inclusions);

        const promises = [];
        this.#inclusions.forEach(inclusion => promises.push(inclusion.process()));
        await Promise.all(promises).catch(exc => console.error(exc.stack));
    }

    destroy() {
        super.destroy();
        this.#listener?.destroy();
        this.#inclusions.forEach(inclusion => inclusion.destroy());
    }
}
