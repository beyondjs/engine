const fs = require('fs').promises;
require('colors');

module.exports = new class {
    #ready = false;
    #stream;
    #error;

    #store;
    get store() {
        return this.#store;
    }

    #onerror = error => {
        if (!error) return;

        this.#error = true;
        console.error('Error found writing dynamic processors logs'.red);
    }

    async #initialise() {
        const is = global.dashboard ? 'dashboard' : 'main';
        const name = `${is}-${process.pid}.log`;
        const dirname = require('path').join(process.cwd(), '.beyond/dps');
        const store = this.#store = require('path').join(dirname, name);

        let exists;
        try {
            await fs.access(store);
            exists = true;
        }
        catch (exc) {
            exists = false;
        }

        exists ? await fs.unlink(store) : await fs.mkdir(dirname, {recursive: true});

        this.#stream = require('fs').createWriteStream(store);
        this.#stream.write('Dynamic processors logs:\n\n', this.#onerror);

        this.#unsaved.forEach(message => this.#stream.write(message, this.#onerror));
        this.#unsaved.length = 0;
        this.#ready = true;
    }

    constructor() {
        this.#initialise().catch(exc => console.log(exc.stack));
    }

    #unsaved = [];

    append(message) {
        if (!this.#ready) {
            this.#unsaved.push(message);
            return;
        }

        !this.#error && this.#stream.write(`${message}\n`, this.#onerror);
    }
}
