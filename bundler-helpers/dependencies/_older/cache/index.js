module.exports = class {
    #db = require('./db');

    // The bundle or transversal packager, or the processor base
    #dependencies;

    constructor(dependencies) {
        this.#dependencies = dependencies;
    }

    async load() {
        let row;

        const {id} = this.#dependencies.container;
        const failed = async exc => {
            console.log(`Error loading dependencies from cache on "${id}": ${exc.message}`);
            this.delete();
        }

        try {
            const select = 'SELECT data FROM packagers WHERE packager_id=?';
            row = await this.#db.get(select, id);
        }
        catch (exc) {
            return await failed(exc);
        }
        if (!row) return;

        try {
            return JSON.parse(row.data);
        }
        catch (exc) {
            return await failed(exc);
        }
    }

    save() {
        const {id} = this.#dependencies.container;
        const data = JSON.stringify(this.#dependencies);

        const sentence = 'INSERT OR REPLACE INTO packagers(packager_id, data) VALUES(?, ?)';
        const params = [id, data];

        const exc = exc => console.log(`Error saving dependencies into cache on "${id}": ${exc.stack}`);
        this.#db.run(sentence, params).catch(exc);
    }

    delete() {
        const sentence = 'DELETE FROM packagers WHERE packager_id=?';

        const {id} = this.#dependencies.container;
        const exc = exc => console.log(`Error deleting dependencies from cache on "${id}": ${exc.stack}`);
        this.#db.run(sentence, id).catch(exc);
    }
}
