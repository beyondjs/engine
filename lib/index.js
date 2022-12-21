require('colors');
const Watchers = require('@beyond-js/watchers/service');

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

    #watchers;

    async #initialise(args) {
        const {valid, inspect, repository} = await require('./checks')(args);
        if (!valid) return;

        require('./global');
        process.title = 'BeyondJS Main Process';

        console.log('¡Welcome to BeyondJS! DevServer is running.'.bold.green);

        const cwd = process.cwd();
        this.#watchers = new Watchers('watchers');
        this.#engine = new (require('./engine'))(cwd, {inspect, repository});
        inspect && (this.#inspect = new (require('./inspect'))(inspect));
        this.#launchers = new (require('./launchers'))(cwd, {inspect});
    }

    constructor(args) {
        this.#initialise(args).catch(exc => console.log(exc.stack));
    }
}
