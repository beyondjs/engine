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

        const {id, packager, extname} = this.#code;
        const {path} = packager;
        try {
            const select = 'SELECT data FROM packagers WHERE packager_id=? AND path=? AND extname=?';
            row = await this.#db.get(select, id, path, extname);
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
        const {id, packager, extname} = this.#code;
        const {path} = packager;

        const sentence = 'INSERT OR REPLACE INTO packagers(packager_id, path, extname, data) VALUES(?, ?, ?, ?)';
        const params = [id, path, extname, data];

        const exc = exc => console.log(`Error saving into cache the code of the packager "${id}": ${exc.stack}`);
        this.#db.run(sentence, params).catch(exc);
    }

    delete() {
        const {id, packager, extname} = this.#code;
        const {path} = packager;

        const sentence = 'DELETE FROM packagers WHERE packager_id=? AND path=? AND extname=?';

        const exc = exc => console.log(`Error deleting from cache the code of the packager "${id}": ${exc.stack}`);
        this.#db.run(sentence, id, path, extname).catch(exc);
    }
}
