module.exports = class {
    #db = require('./db');
    #code;

    constructor(code) {
        this.#code = code;
    }

    async load() {
        let row;

        const failed = async exc => {
            console.log(`Error loading from cache the code of the packager "${this.#code.id}": ${exc.message}`);
            await this.delete();
        }

        const {id, extname} = this.#code;
        try {
            const select = 'SELECT data FROM packagers WHERE packager_id=? AND extname=?';
            row = await this.#db.get(select, id, extname);
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
        const {id, extname} = this.#code;

        const sentence = 'INSERT OR REPLACE INTO packagers(packager_id, extname, data) VALUES(?, ?, ?)';
        const params = [id, extname, data];

        const exc = exc => console.log(`Error saving into cache the code of the packager "${id}": ${exc.stack}`);
        this.#db.run(sentence, params).catch(exc);
    }

    delete() {
        const {id, extname} = this.#code;
        const sentence = 'DELETE FROM packagers WHERE packager_id=? AND extname=?';

        const exc = exc => console.log(`Error deleting from cache the code of the packager "${id}": ${exc.stack}`);
        this.#db.run(sentence, id, extname).catch(exc);
    }
}
