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
        const {vspecifier} = this.#dependencies;

        let row;
        try {
            const select = 'SELECT * FROM dependencies WHERE vspecifier=?';
            row = await this.#db.get(select, vspecifier);
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
        const {vspecifier} = this.#dependencies;

        this.#value = this.#dependencies.toJSON();

        const statement = 'INSERT OR REPLACE INTO dependencies(vspecifier, data) VALUES(?, ?)';
        this.#db.run(statement, [vspecifier, JSON.stringify(this.#value)])
            .catch(exc => console.log('Error saving dependencies tree into cache:', exc.stack));
    }

    async delete() {
        const {vspecifier} = this.#dependencies;

        try {
            const sentence = 'DELETE FROM dependencies WHERE vspecifier=?';
            await this.#db.run(sentence, vspecifier);
        }
        catch (exc) {
            console.log('Error deleting dependencies tree cache:', exc.stack);
        }
    }
}
