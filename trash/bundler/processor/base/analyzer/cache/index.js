module.exports = class {
    #db = require('./db');
    #analyzer;

    constructor(analyzer) {
        this.#analyzer = analyzer;
    }

    async load() {
        const {id} = this.#analyzer.processor;

        let row;
        try {
            const select = 'SELECT * FROM analyzers WHERE processor_id=?';
            row = await this.#db.get(select, id);
            if (!row) return;
        }
        catch (exc) {
            console.log('Error loading analyzer interfaces from cache:', exc.stack);
            return;
        }

        try {
            return JSON.parse(row.data);
        }
        catch (exc) {
            console.log('Error loading analyzer interfaces from cache:', exc.stack);
            await this.delete();
        }
    }

    async save() {
        const {id} = this.#analyzer.processor;

        try {
            const data = JSON.stringify(this.#analyzer);
            await this.#db.run('INSERT OR REPLACE INTO analyzers(processor_id, data) VALUES(?, ?)',
                [id, data]);
        }
        catch (exc) {
            console.log('Error saving analyzer interfaces into cache:', exc.stack);
        }
    }

    async delete() {
        const {id} = this.#analyzer.processor;

        try {
            const sentence = 'DELETE FROM analyzers WHERE processor_id=?';
            await this.#db.run(sentence, id);
        }
        catch (exc) {
            console.log('Error deleting analyzer interfaces cache:', exc.stack);
        }
    }
}
