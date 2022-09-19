const sqlite = require('sqlite3');
const {fs} = global.utils;
const {promisify} = require('util');

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
        this.#ready = Promise.pending();

        const is = global.dashboard ? '-dashboard' : '';
        const name = `preprocessors${is}.db`;
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

        await this.#run('CREATE TABLE IF NOT EXISTS preprocessors (' +
            'processor_id TEXT NOT NULL, ' +
            'data TEXT NOT NULL);');

        await this.#run('CREATE UNIQUE INDEX IF NOT EXISTS processor_id_index on preprocessors (processor_id);');
        this.#ready.resolve();
    }
}
