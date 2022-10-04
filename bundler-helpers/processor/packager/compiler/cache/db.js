const sqlite = require('sqlite3');
const fs = require('beyond/utils/fs');
const {promisify} = require('util');
const PendingPromise = require('beyond/utils/pending-promise');

module.exports = new class {
    #db;
    #ready;
    #run;
    #get;

    constructor() {
        this.ready().catch(exc => console.error(exc.stack));
    }

    async run(...params) {
        await this.ready();
        return await this.#run(...params);
    }

    async get(...params) {
        await this.ready();
        return await this.#get(...params);
    }

    ready = async () => {
        if (this.#ready) return this.#ready.value;
        this.#ready = new PendingPromise();

        const name = 'compilers.db';
        const dirname = require('path').join(process.cwd(), '.beyond/cache');
        const store = require('path').join(dirname, name);

        const exists = await fs.exists(store);
        !exists && await fs.mkdir(dirname, {recursive: true});

        this.#db = new sqlite.Database(store);
        this.#run = promisify(this.#db.run.bind(this.#db));
        this.#get = promisify(this.#db.get.bind(this.#db));

        if (exists) {
            this.#ready.resolve();
            return;
        }

        await this.#run('CREATE TABLE IF NOT EXISTS compilations (' +
            'processor_id TEXT NOT NULL, ' +
            'data TEXT NOT NULL);');

        await this.#run('CREATE UNIQUE INDEX IF NOT EXISTS processor_id_index on compilations (processor_id);');
        this.#ready.resolve();
    }
}
