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

    #launchers;
    get launchers() {
        return this.#launchers;
    }

    constructor({inspect, registry}) {
        process.title = 'BeyondJS Main Process';
        console.log('Welcome to BeyondJS!'.bold.green);

        this.#watchers = new WatchersService('watchers');
        this.#core = new (require('./core'))({registry});
        inspect && (this.#inspect = new (require('./inspect'))(inspect));
        this.#launchers = new (require('./launchers'))({inspect});
    }
}
