module.exports = new class {
    #engine;
    get engine() {
        return this.#engine;
    }

    #inspect;
    get inspect() {
        return this.#inspect;
    }

    #launchers;
    get launchers() {
        return this.#launchers;
    }

    constructor() {
        require('./global');
        require('./watchers/main');
        process.title = 'BeyondJS Main Process';

        const cwd = process.cwd();
        this.#engine = new (require('./engine'))(cwd);
        this.#inspect = new (require('./inspect'))(4000);
        this.#launchers = new (require('./launchers'))(cwd);
    }
}