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

    async #initialise(args) {
        const {valid, inspect, repository} = await require('./checks')(args);
        if (!valid) return;

        require('./global');
        require('./watchers/main');
        process.title = 'BeyondJS Main Process';

        console.log('¡Welcome to BeyondJS! DevServer is running.'.bold.green);

        const cwd = process.cwd();
        this.#engine = new (require('./engine'))(cwd, {inspect, repository});
        inspect && (this.#inspect = new (require('./inspect'))(inspect));
        this.#launchers = new (require('./launchers'))(cwd, {inspect});
    }

    constructor(args) {
        this.#initialise(args).catch(exc => console.log(exc.stack));
    }
}
