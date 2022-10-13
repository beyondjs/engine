const fs = require('fs').promises;
const {join, dirname} = require('path');

const exists = file => new Promise(r => fs.access(file)
    .then(() => r(true))
    .catch(() => r(false)));

module.exports = class {
    #building;
    #path;

    constructor(building, path) {
        this.#building = building;
        this.#path = path;
    }

    get target() {
        const {vspecifier} = this.#building;
        return join(this.#path, `${vspecifier}.js`);
    }

    async load() {
        const {target} = this;
        if (!(await exists(target))) return {};

        try {
            const data = await fs.readFile(target, 'utf8');
            return JSON.parse(data);
        }
        catch (exc) {
            return {error: exc.message};
        }
    }

    async save(data) {
        const {target} = this;
        console.log(`Saving processed build "${this.#building.vspecifier}" to "${target}"`);

        try {
            await fs.mkdir(dirname(target), {recursive: true});
            const json = JSON.stringify(data);
            await fs.writeFile(target, json, 'utf8');
        }
        catch (exc) {
            console.error(`Error saving build cache to "${target}": ${exc.message}`);
        }
    }
}
