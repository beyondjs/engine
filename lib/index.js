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

    constructor({inspect}) {
        process.title = 'BeyondJS Main Process';
        console.log('Welcome to BeyondJS!'.bold.green);

        const cwd = process.cwd();

        require('./watchers/main');
        this.#engine = new (require('./core'))(cwd);
        inspect && (this.#inspect = new (require('./inspect'))(inspect));
        this.#launchers = new (require('./launchers'))(cwd, {inspect});
    }
}
