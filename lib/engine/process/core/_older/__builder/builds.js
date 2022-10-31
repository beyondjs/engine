const {fs} = global.utils;

module.exports = class {
    #builder;
    #file;
    get file() {
        return this.#file;
    }

    #initialised = false;

    constructor(builder) {
        this.#builder = builder;
    }

    async #initialise() {
        if (this.#initialised) return;
        this.#initialised = true;

        const {application} = this.#builder;
        await application.ready;
        this.#file = require('path').join(application.path, '.beyond/builds/builds.json');
    }

    async read() {
        await this.#initialise();

        const file = this.#file;
        let builds = {};
        if (!(await fs.exists(file))) return builds;

        try {
            const content = await fs.readFile(file);
            builds = JSON.parse(content);
        }
        catch (exc) {
            console.error(`Error reading or parsing builds information file "${file}"`);
        }
        return builds;
    }

    async append(paths, distribution, finalised) {
        await this.#initialise();

        const data = await this.read();
        data[distribution.name] = {
            platform: distribution.platform,
            environment: distribution.environment,
            compress: distribution.compress,
            base: paths.base,
            archive: paths.archive,
            finalised: !!finalised,
            time: Date.now()
        };

        await fs.save(this.#file, require('json-format')(data, {
            type: 'space',
            size: 2
        }));
    }
}
