module.exports = class {
    #db = require('./db');
    #dependencies;

    #value;
    get value() {
        return this.#value;
    }

    constructor(dependencies) {
        this.#dependencies = dependencies;
    }

    async load() {
        const {hash} = this.#dependencies;

        let row;
        try {
            const select = 'SELECT * FROM dependencies WHERE hash=?';
            row = await this.#db.get(select, hash);
        }
        catch (exc) {
            console.log('Error loading dependencies tree from cache:', exc.stack);
            return;
        }
        if (!row) return;

        try {
            this.#value = JSON.parse(row.data);
        }
        catch (exc) {
            console.log('Error loading dependencies tree from cache:', exc.stack);
            await this.delete();
        }
    }

    save() {
        const {hash} = this.#dependencies;

        this.#value = this.#dependencies.toJSON();

        const statement = 'INSERT OR REPLACE INTO dependencies(hash, data) VALUES(?, ?)';
        this.#db.run(statement, [hash, JSON.stringify(this.#value)])
            .catch(exc => console.log('Error saving dependencies tree into cache:', exc.stack));
    }

    async delete() {
        const {hash} = this.#dependencies;

        try {
            const sentence = 'DELETE FROM dependencies WHERE hash=?';
            await this.#db.run(sentence, hash);
        }
        catch (exc) {
            console.log('Error deleting dependencies tree from cache:', exc.stack);
        }
    }
}
