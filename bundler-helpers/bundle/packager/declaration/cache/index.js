module.exports = class {
    #packager;
    #db = require('./db');

    constructor(packager) {
        this.#packager = packager;
    }

    async load() {
        let row;

        const failed = async exc => {
            console.log(`Error loading from cache the declaration of the packager "${this.#packager.id}": ${exc.message}`);
            this.delete();
        }

        try {
            const select = 'SELECT * FROM declarations WHERE packager_id=?';
            row = await this.#db.get(select, this.#packager.id);
        }
        catch (exc) {
            return await failed(exc);
        }
        if (!row || !row.hash) return;

        let data;
        try {
            data = JSON.parse(row.data);
        }
        catch (exc) {
            return await failed(exc);
        }

        return {code: data.code, errors: data.errors, hash: row.hash};
    }

    save(code, errors, hash) {
        const data = JSON.stringify({code: code, errors: errors});

        const sentence = 'INSERT OR REPLACE INTO declarations(packager_id, data, hash) VALUES(?, ?, ?)';
        const params = [this.#packager.id, data, hash];

        const exc = exc => console.log(`Error saving into cache the declaration of the packager "${this.#packager.id}": ${exc.stack}`);
        this.#db.run(sentence, params).catch(exc);
    }

    delete() {
        const sentence = 'DELETE FROM declarations WHERE packager_id=?';

        const exc = exc => console.log(`Error deleting from cache the declaration of the packager "${this.#packager.id}": ${exc.stack}`);
        this.#db.run(sentence, this.#packager.id).catch(exc);
    }
}
