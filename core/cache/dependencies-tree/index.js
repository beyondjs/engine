module.exports = class {
    #db = require('./db');
    #vspecifier;

    #value;
    get value() {
        return this.#value;
    }

    constructor(vspecifier) {
        this.#vspecifier = vspecifier;
    }

    async load() {
        let row;
        try {
            const select = 'SELECT * FROM dependencies WHERE vspecifier=?';
            row = await this.#db.get(select, this.#vspecifier);
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

    save(data) {
        this.#value = data;

        const statement = 'INSERT OR REPLACE INTO dependencies(' + 'vspecifier, data) VALUES(?, ?)';
        this.#db.run(statement, [this.#vspecifier, JSON.stringify(data)])
            .catch(exc => console.log('Error saving dependencies tree into cache:', exc.stack));
    }

    async delete() {
        try {
            const sentence = 'DELETE FROM dependencies WHERE vspecifier=?';
            await this.#db.run(sentence, this.#vspecifier);
        }
        catch (exc) {
            console.log('Error deleting dependencies tree cache:', exc.stack);
        }
    }
}
