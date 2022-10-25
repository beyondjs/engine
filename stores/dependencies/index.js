module.exports = class {
    #db = require('./db');

    async get(vspecifier, platform) {
        let row;

        const failed = async exc => {
            console.log(`Error getting the dependencies of "${vspecifier}:${platform}": ${exc.message}`);
            await this.delete(vspecifier, platform);
        }

        try {
            const select = 'SELECT dependency FROM packagers WHERE packager_id=? AND extname=?';
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
    save(vspecifier, platform, dependencies) {
        const sentences = [`DELETE FROM dependencies WHERE vspecifier=${vspecifier} AND platform=${platform};`];

        dependencies.forEach(dependency => {
            sentences.push('INSERT OR REPLACE INTO packagers(packager_id, extname, data) ' +
                `VALUES("${vspecifier}", "${platform}", "${dependency}");`);
        });

        const exc = exc => console.log(`Error saving the dependencies of "${vspecifier}:${platform}": ${exc.stack}`);
        this.#db.run(sentences.join('\n'), params).catch(exc);
    }

    delete(vspecifier, platform) {
        const sentence = 'DELETE FROM dependencies WHERE vspecifier=? AND platform=?';

        const exc = exc => console.log(`Error deleting the dependencies of "${vspecifier}:${platform}": ${exc.stack}`);
        this.#db.run(sentence, vspecifier, platform).catch(exc);
    }
}
