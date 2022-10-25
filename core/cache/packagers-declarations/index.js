module.exports = class {
    #packager;
    #db = require('./db');

    constructor(packager) {
        this.#packager = packager;
    }

    async load() {
        const {id} = this.#packager;
        let row;

        const failed = async exc => {
            console.log(`Error loading from cache the declaration of the packager "${id}": ${exc.message}`);
            this.delete();
        }

        try {
            const select = 'SELECT * FROM declarations WHERE packager_id=?';
            row = await this.#db.get(select, id);
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

        return {data, hash: row.hash};
    }

    save() {
        const {id, hash} = this.#packager;
        const data = this.#packager.toJSON();

        const sentence = 'INSERT OR REPLACE INTO declarations(packager_id, data, hash) VALUES(?, ?, ?)';
        const params = [id, data, hash];

        const exc = exc => console.log(`Error saving into cache the declaration of the packager "${id}": ${exc.stack}`);
        this.#db.run(sentence, params).catch(exc);
    }

    delete() {
        const {id} = this.#packager;
        const sentence = 'DELETE FROM declarations WHERE packager_id=?';

        const exc = exc => console.log(`Error deleting from cache the declaration of the packager "${id}": ${exc.stack}`);
        this.#db.run(sentence, id).catch(exc);
    }
}
