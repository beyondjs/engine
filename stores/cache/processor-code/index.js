module.exports = class {
    #db = require('./db');
    #code;

    /**
     * Processor's code builder cache constructor
     * @param code {*} The processor's code builder
     */
    constructor(code) {
        this.#code = code;
    }

    async load() {
        const {id} = this.#code;

        let row;
        try {
            const select = 'SELECT * FROM processors_code WHERE processor_code_id=?';
            row = await this.#db.get(select, id);
        }
        catch (exc) {
            console.log('Error loading processor\'s code from cache:', exc.stack);
            return;
        }
        if (!row) return;

        try {
            return JSON.parse(row.data);
        }
        catch (exc) {
            console.log('Error loading processor\'s code from cache:', exc.stack);
            await this.delete();
        }
    }

    async save() {
        const {id} = this.#code;

        try {
            const data = JSON.stringify(this.#code);
            await this.#db.run('INSERT OR REPLACE INTO processors_code(' +
                'processor_code_id, data) VALUES(?, ?)',
                [id, data]);
        }
        catch (exc) {
            console.log('Error saving processor\'s code into cache:', exc.stack);
        }
    }

    async delete() {
        const {id} = this.#code;

        try {
            const sentence = 'DELETE FROM processors_code WHERE processor_code_id=?';
            await this.#db.run(sentence, id);
        }
        catch (exc) {
            console.log('Error deleting processor\'s code cache:', exc.stack);
        }
    }
}
