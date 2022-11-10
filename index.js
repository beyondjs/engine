require('colors');
const WatchersService = require('beyond/utils/watchers/service');

module.exports = class {
    #watchers;

    #core;
    get core() {
        return this.#core;
    }

    #inspect;
    get inspect() {
        return this.#inspect;
    }

    #applications;
    get applications() {
        return this.#applications;
    }

    async #initialise(args) {
        const {valid, inspect, repository} = await require('./checks')(args);
        if (!valid) return;

        process.title = 'BeyondJS Main Process';
        console.log('Welcome to BeyondJS!'.bold.green);

        this.#watchers = new WatchersService('watchers');
        this.#core = new (require('./core'))({repository});
        inspect && (this.#inspect = new (require('./inspect'))(inspect));
        this.#applications = new (require('./applications'))({inspect});
    }

    constructor(args) {
        this.#initialise(args).catch(exc => console.log(exc.stack));
    }
}
