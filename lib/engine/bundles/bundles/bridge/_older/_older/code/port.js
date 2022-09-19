const {ipc} = global.utils;
const {EventEmitter} = require('events');

module.exports = class extends EventEmitter {
    #bee;
    get bee() {
        return this.#bee;
    }

    #value;
    get value() {
        return this.#value;
    }

    #ready = false;
    get ready() {
        return this.#ready;
    }

    #error;
    get error() {
        return this.#error;
    }

    constructor() {
        super();
    }

    update(pkg, distribution) {
        const bee = `${pkg}/${distribution}`;
        if (this.#bee === bee) return;

        this.#value = void 0;
        this.#ready = false;

        const {dashboard} = global;
        const instance = dashboard ? 'dashboard' : 'main';

        ipc.exec('main', 'bees/data', bee, instance)
            .then(data => {
                console.log('bees/data on bridge port', data);

                this.#value = data?.ports?.http;
                this.#ready = true;
                this.emit('change');
            })
            .catch(exc => {
                this.#error = exc.message;
            });
    }
}
