module.exports = class {
    #db = require('./db');
    #code;

    constructor(code) {
        this.#code = code;
    }

    async load() {
        let row;

        const failed = async exc => {
            console.log(`Error loading code from cache "${this.#code.id}": ${exc.message}`);
            await this.delete();
        }

        const {id} = this.#code;
        try {
            const select = 'SELECT data FROM code WHERE id=?';
            row = await this.#db.get(select, id);
        }
        catch (exc) {
            return await failed(exc);
        }
        if (!row) return;

        let data;
        try {
            data = JSON.parse(row.data);
            return data;
        }
        catch (exc) {
            return await failed(exc);
        }
    }

    /**
     * Save the bundle packager code
     */
    save() {
        const data = JSON.stringify(this.#code);
        const {id} = this.#code;

        const sentence = 'INSERT OR REPLACE INTO code(id, data) VALUES(?, ?)';
        const params = [id, data];

        const exc = exc => console.log(`Error saving code into cache "${id}": ${exc.stack}`);
        this.#db.run(sentence, params).catch(exc);
    }

    delete() {
        const {id} = this.#code;
        const sentence = 'DELETE FROM code WHERE id=?';

        const exc = exc => console.log(`Error deleting code from cache "${id}": ${exc.stack}`);
        this.#db.run(sentence, id).catch(exc);
    }
}
