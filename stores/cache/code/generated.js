module.exports = class {
    #db = require('./db');
    #outputs;

    constructor(outputs) {
        this.#outputs = outputs;
    }

    async load() {
        const {id} = this.#outputs;

        const failed = async exc => {
            console.log(`Error loading generated code from cache "${id}": ${exc.message}`);
            await this.delete();
        }

        let row;
        try {
            const select = 'SELECT data FROM generated_code WHERE id=?';
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
     * Save the generated code
     */
    save() {
        const data = JSON.stringify(this.#outputs);
        const {id} = this.#outputs;

        const sentence = 'INSERT OR REPLACE INTO generated_code(id, data) VALUES(?, ?)';
        const params = [id, data];

        const exc = exc => console.log(`Error saving generated code into cache "${id}": ${exc.stack}`);
        this.#db.run(sentence, params).catch(exc);
    }

    delete() {
        const {id} = this.#outputs;
        const sentence = 'DELETE FROM code WHERE id=?';

        const exc = exc => console.log(`Error deleting generated code from cache "${id}": ${exc.stack}`);
        this.#db.run(sentence, id).catch(exc);
    }
}
