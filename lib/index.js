require('colors');
module.exports = class {
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

    constructor({workspace}) {
        require('./global');
        require('./watchers/main');
        process.title = 'BeyondJS Main Process';

        console.log('Welcome to BeyondJS!'.bold.green);

        const cwd = process.cwd();
        this.#engine = new (require('./engine'))(cwd);
        workspace && (this.#inspect = new (require('./inspect'))(workspace));
        this.#launchers = new (require('./launchers'))(cwd);
    }
}
