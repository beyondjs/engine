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
        require('./global');
        require('./watchers/main');
        process.title = 'BeyondJS Main Process';

        console.log('¡Welcome to BeyondJS! DevServer is running.'.bold.green);

        const cwd = process.cwd();
        this.#engine = new (require('./engine'))(cwd, {inspect});
        inspect && (this.#inspect = new (require('./inspect'))(inspect));
        this.#launchers = new (require('./launchers'))(cwd, {inspect});
    }
}
