module.exports = class {
    #db = require('./db');
    #preprocessor;

    constructor(preprocessor) {
        this.#preprocessor = preprocessor;
    }

    async load() {
        let row;
        try {
            const {id} = this.#preprocessor.processor;
            const select = 'SELECT * FROM preprocessors WHERE processor_id=?';
            row = await this.#db.get(select, id);
        }
        catch (exc) {
            console.log('Error loading preprocess from cache:', exc.stack);
            return;
        }
        if (!row) return;

        try {
            return JSON.parse(row.data);
        }
        catch (exc) {
            console.log('Error loading preprocess from cache:', exc.stack);
            await this.delete();
        }
    }

    async save() {
        const {id} = this.#preprocessor.processor;

        try {
            const data = JSON.stringify(this.#preprocessor);
            await this.#db.run('INSERT OR REPLACE INTO preprocessors(' +
                'processor_id, data) VALUES(?, ?)',
                [id, data]);
        }
        catch (exc) {
            console.log('Error saving preprocess into cache:', exc.stack);
        }
    }

    async delete() {
        const {id} = this.#preprocessor.processor;

        try {
            const sentence = 'DELETE FROM preprocessors WHERE processor_id=?';
            await this.#db.run(sentence, id);
        }
        catch (exc) {
            console.log('Error deleting preprocess cache:', exc.stack);
        }
    }
}
