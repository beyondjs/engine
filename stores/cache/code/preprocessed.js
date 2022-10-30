module.exports = class {
    #db = require('./db');
    #preprocessor;

    constructor(preprocessor) {
        this.#preprocessor = preprocessor;
    }

    async load() {
        const {id} = this.#preprocessor;

        const failed = async exc => {
            console.log(`Error loading preprocessed code from cache "${id}": ${exc.message}`);
            await this.delete();
        }

        let row;
        try {
            const select = 'SELECT data FROM preprocessed_code WHERE id=?';
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
     * Save the preprocessed code
     */
    save() {
        const data = JSON.stringify(this.#preprocessor);
        const {id} = this.#preprocessor;

        const sentence = 'INSERT OR REPLACE INTO preprocessed_code(id, data) VALUES(?, ?)';
        const params = [id, data];

        const exc = exc => console.log(`Error saving preprocessed code into cache "${id}": ${exc.stack}`);
        this.#db.run(sentence, params).catch(exc);
    }

    delete() {
        const {id} = this.#preprocessor;
        const sentence = 'DELETE FROM preprocessed_code WHERE id=?';

        const exc = exc => console.log(`Error deleting preprocessed code from cache "${id}": ${exc.stack}`);
        this.#db.run(sentence, id).catch(exc);
    }
}
