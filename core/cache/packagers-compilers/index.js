module.exports = class {
    #db = require('./db');
    #compiler;

    constructor(compiler) {
        this.#compiler = compiler;
    }

    async load() {
        const {id} = this.#compiler.packager;

        let row;
        try {
            const select = 'SELECT * FROM compilations WHERE packager_id=?';
            row = await this.#db.get(select, id);
        }
        catch (exc) {
            console.log('Error loading compiler compilation from cache:', exc.stack);
            return;
        }
        if (!row) return;

        try {
            return JSON.parse(row.data);
        }
        catch (exc) {
            console.log('Error loading compiler compilation from cache:', exc.stack);
            await this.delete();
        }
    }

    async save() {
        const {id} = this.#compiler.packager;

        try {
            const data = JSON.stringify(this.#compiler);
            await this.#db.run('INSERT OR REPLACE INTO compilations(' +
                'packager_id, data) VALUES(?, ?)',
                [id, data]);
        }
        catch (exc) {
            console.log('Error saving compiler compilation into cache:', exc.stack);
        }
    }

    async delete() {
        const {id} = this.#compiler.packager;

        try {
            const sentence = 'DELETE FROM compilations WHERE processor_id=?';
            await this.#db.run(sentence, id);
        }
        catch (exc) {
            console.log('Error deleting compiler compilation cache:', exc.stack);
        }
    }
}
